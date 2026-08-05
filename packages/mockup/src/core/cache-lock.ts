/**
 * 共有 vite `cacheDir` の使用権を表すプロセス間ロック。
 *
 * vite の依存最適化は、キャッシュの commit を「既存 deps を退避 → 新しい deps を rename」という
 * 連続の `fs.renameSync` で行い、そこにプロセス間の排他は無い（リトライ付き rename は Windows 専用）。
 * 同じ cacheDir へ複数プロセスが同時に書くと ENOTEMPTY / ENOENT で commit に失敗し、vite は
 * エラーログ1行で続行するため、負けた側は依存最適化を失ったままブラウザ表示が壊れる。
 * そのため、共有 cacheDir へ書き込むプロセスはこのロックを取ってから使い、取れない場合は
 * 呼び出し側がプロセス固有のディレクトリへ退避する。
 *
 * ロックの実体は `<cacheDir>.lock` ファイル。`wx` フラグ（O_CREAT | O_EXCL）による作成が
 * 原子的な取得判定を兼ね、中身に保持プロセスの pid を書く。SIGKILL やクラッシュで残った
 * ロックは pid の生存確認で検出し、rename で退避してから取り直す（同じ stale ロックを
 * 複数プロセスが同時に見つけても、rename に成功した1つしか取り直せない）。
 */
import fs from 'node:fs';

export interface CacheDirLock {
  /** ロックファイルの絶対パス。 */
  readonly lockPath: string;
  /** ロックを解放する。2回以上呼んでも無害。 */
  release(): void;
}

/** pid の生存確認。EPERM は「存在するが他ユーザー所有」なので生存として扱う。 */
function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

/** ロックファイルが記録している pid。読めない・正の整数でない場合は null。 */
function readLockPid(lockPath: string): number | null {
  try {
    const pid = Number.parseInt(fs.readFileSync(lockPath, 'utf-8'), 10);
    // 0 以下を process.kill() に渡すとプロセスグループへのシグナルになるため、正の値だけを pid として扱う。
    return Number.isSafeInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

/** `wx`（既存ならエラー）で自分の pid を書き込む。作成できたら取得成功。 */
function tryCreateLock(lockPath: string): boolean {
  try {
    fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 死んだプロセスが残したロックを退避して取り直す。
 *
 * 「unlink して作り直す」だと、stale 判定から unlink までの間に別プロセスが作った生きたロックを
 * 消してしまう恐れがある。先に rename で退避し、退避した中身が判定に使った stale pid のままかを
 * 確かめてから取り直す。違っていた（生きたロックを退避してしまった）場合は、上書きしない
 * `linkSync` で元の場所へ戻して諦める。
 */
function stealStaleLock(lockPath: string, stalePid: number): boolean {
  const aside = `${lockPath}.stale-${process.pid}`;
  try {
    fs.renameSync(lockPath, aside);
  } catch {
    return false; // 別プロセスが先に退避した
  }
  if (readLockPid(aside) !== stalePid) {
    try {
      fs.linkSync(aside, lockPath);
      fs.unlinkSync(aside);
    } catch {
      // 戻し先に既に別のロックが作られていた場合はそのまま（退避ファイルは tmpdir の掃除に任せる）。
    }
    return false;
  }
  try {
    fs.unlinkSync(aside);
  } catch {
    // 消せなくても取得の成否には影響しない。
  }
  return tryCreateLock(lockPath);
}

/**
 * `cacheDir` の使用権ロックを取得する。取れなければ null（呼び出し側が退避先を決める）。
 * 解放はプロセスの終了経路（`MockupRuntime.cleanup()`）から `release()` を呼ぶ。
 * 解放されないまま死んだ場合も、次に取得を試みるプロセスが stale として回収する。
 */
export function acquireCacheDirLock(cacheDir: string): CacheDirLock | null {
  const lockPath = `${cacheDir}.lock`;
  let acquired = tryCreateLock(lockPath);
  if (!acquired) {
    const holder = readLockPid(lockPath);
    // pid を読めないロックは「作成直後で pid 書き込み前」の可能性を否定できないため生存扱いにする
    // （生きたロックを誤って奪うより、キャッシュ共有を1回諦める方が安全）。
    if (holder !== null && !isProcessAlive(holder)) acquired = stealStaleLock(lockPath, holder);
  }
  if (!acquired) return null;

  let released = false;
  return {
    lockPath,
    release() {
      if (released) return;
      released = true;
      try {
        // 万一ロックが奪われていた場合に他プロセスのロックを消さないよう、自分の pid のときだけ消す。
        if (readLockPid(lockPath) === process.pid) fs.unlinkSync(lockPath);
      } catch {
        // 消せなくても、次に取得を試みるプロセスが stale として回収する。
      }
    },
  };
}
