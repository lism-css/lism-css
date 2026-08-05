/**
 * `dev` / `check` が共有する実行時状態。
 *
 * データディレクトリの検証結果に加え、生成 config・トークン CSS・vite 用の一時ディレクトリを
 * 1つのオブジェクトにまとめる。dev の watch で内容が差し替わっても、vite プラグイン側は
 * この runtime を参照し続けるだけで最新状態を読める。
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { claimViteCacheDir, type ViteCacheClaim } from './cache-claim.js';
import { readMockConfig, resolveDataDir } from './data-dir.js';
import { discoverPages } from './pages.js';
import { getMockPackageRoot, safeRealpath, toImportSpecifier } from './paths.js';
import { buildTokensArtifacts, loadTokens, writeConfigModule } from './tokens.js';
import type { MockupData, TokenGroupEntry } from './types.js';

export interface MockupRuntime {
  /** 最新の検証済みデータ（watch で差し替わる）。 */
  data: MockupData;
  /** 生成した lism.config モジュールの絶対パス。 */
  readonly configPath: string;
  /** 上の lism.config モジュールを置くディレクトリ（同じ入力なら起動をまたいで同じ場所）。 */
  readonly configDir: string;
  /** vite の `cacheDir`（依存の事前バンドル先。同じ入力なら起動をまたいで使い回す。dev では占有した `.inuse.<pid>` パス）。 */
  readonly cacheDir: string;
  /** 生成物を置く一時ディレクトリのルート（プロセス固有。`cleanup()` で消える）。 */
  readonly tempDir: string;
  /** `serializeTokens()` の結果（`virtual:lism-mockup/tokens.css` の中身）。 */
  tokensCss: string;
  /** 上の CSS が定義するトークンの内訳（`virtual:lism-mockup/tokens` の中身）。 */
  tokensData: TokenGroupEntry[];
  /** 仮想モジュールが生成する動的 import 指定子の集合（境界チェックの照合用）。 */
  getPageSpecifiers(): ReadonlySet<string>;
  /** `mockup.config.json` と `pages/` を読み直す。 */
  refreshPages(): void;
  /** トークンファイルを読み直し、config モジュール・トークン CSS・トークン一覧を作り直す。 */
  refreshTokens(): Promise<void>;
  /** 一時ディレクトリを削除し、占有した cacheDir を共有パスへ返す（キャッシュの中身と `configDir` は次回起動のために残す）。 */
  cleanup(): void;
}

/** `@lism-css/mockup` 自身のバージョン。読めない場合はキャッシュキー用の既定値を返す。 */
function readMockPackageVersion(packageRoot: string): string {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')) as { version?: unknown };
    return typeof manifest.version === 'string' ? manifest.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 起動間で共有する生成物（vite の依存キャッシュ・生成 config）を置く場所のキー。
 *
 * 「事前バンドルの結果が変わる入力」をハッシュする。CLI のバージョンと実体位置
 * （別インストールなら同梱依存も別物）、データディレクトリ、`imports` の追加パッケージ
 * （プロジェクト側から解決するので事前バンドル対象が変わる）。
 * 入力が変われば別のディレクトリになるため、古いキャッシュを引き当てることはない。
 */
function sharedDirKey(dataDir: string, imports: readonly string[]): string {
  const packageRoot = safeRealpath(getMockPackageRoot());
  return (
    createHash('sha256')
      // `imports` は宣言順を変えても中身が同じなら同じキャッシュでよいので並べ替えてから混ぜる。
      .update(JSON.stringify([readMockPackageVersion(packageRoot), packageRoot, dataDir, [...imports].sort()]))
      .digest('hex')
      .slice(0, 16)
  );
}

/** 共有ディレクトリの置き場所（macOS の os.tmpdir() はシンボリックリンクなので realpath 化して使う）。 */
function sharedDirRoot(): string {
  return safeRealpath(os.tmpdir());
}

/**
 * vite の `cacheDir`（依存の事前バンドル先）の場所を決める。
 *
 * プロセス固有の一時ディレクトリに置くと毎回ゼロから事前バンドルし直しになるため、
 * `os.tmpdir()` 配下の安定した場所へ置いて起動間で使い回す（データディレクトリ側には書かないので、
 * 読み取り専用の配布物（npx キャッシュ等）から実行しても動く、という設計は維持できる）。
 *
 * 同じ入力で2つ同時に起動すると同じディレクトリを指すが、vite の依存最適化はキャッシュの
 * commit（rename の連続）にプロセス間の排他を持たず、同時に書くと ENOTEMPTY / ENOENT で
 * commit に失敗して負けた側が依存最適化を失う。そのため、書き込みを行う dev はこのパスを
 * そのまま使わず、`claimViteCacheDir()` で `<このパス>.inuse.<pid>` へ rename して占有してから
 * 使う（`prepareViteCacheDir()` 参照）。このパスが存在するのは「誰も使っていない」ときだけ。
 */
export function resolveViteCacheDir(dataDir: string, imports: readonly string[] = []): string {
  return path.join(sharedDirRoot(), `lism-mockup-cache-${sharedDirKey(dataDir, imports)}`);
}

/**
 * 生成した lism.config モジュールを置くディレクトリを決める。
 *
 * ここも `cacheDir` と同じキーの安定パスにする。`lismConfigAlias()` はこのファイルのパスを
 * `resolve.alias` に入れ、vite は `resolve` をまるごと依存キャッシュのキーに含めるため、
 * パスが起動ごとに変わると毎回「vite config has changed」で事前バンドルをやり直してしまい、
 * `cacheDir` を共有した意味が無くなる。
 *
 * ただし `cacheDir` の中には置かない。vite の watcher は `<cacheDir>/**` を監視対象から外すため、
 * 中に置くと `tokens.json` の変更でこのモジュールを書き換えても invalidate されず、
 * ブラウザに古い config が残ってしまう。そのため兄弟ディレクトリにする。
 *
 * 同じデータディレクトリで2つ同時に起動すると同じファイルを共有するが、内容は
 * そのデータディレクトリの `tokens.json` だけから決まる（キーにデータディレクトリを含むため、
 * 共有する2プロセスは必ず同じ `tokens.json` を読む）ので、書き込む中身は常に同一になる。
 * 書き込み自体も `writeConfigModule()` が rename で原子的に置き換えるため、
 * 相手プロセスの vite が書き込み途中の状態を読むことはない。
 */
export function resolveGeneratedConfigDir(dataDir: string, imports: readonly string[] = []): string {
  return path.join(sharedDirRoot(), `lism-mockup-config-${sharedDirKey(dataDir, imports)}`);
}

interface PreparedViteCacheDir {
  cacheDir: string;
  /** 共有 cacheDir の占有（取っていない場合は null）。 */
  claim: ViteCacheClaim | null;
}

/**
 * vite の `cacheDir` を用意する。
 *
 * ディレクトリ自体は作らない（占有した場合を除く）。事前バンドルを行う `dev` では vite が
 * 必要になった時点で作るため、キャッシュを使わない `check`（build）が空ディレクトリを残さずに済む。
 *
 * `exclusive`（依存の事前バンドルを書き込む dev）では、共有パスを `<共有パス>.inuse.<pid>` へ
 * rename して占有し、そこを cacheDir にする。占有できない（別プロセスが使用中、他ユーザー所有で
 * rename も新規作成もできない等）場合は、プロセス固有の一時ディレクトリへ退避して起動を止めない
 * （キャッシュの再利用を諦めて毎回事前バンドルするだけで、動作は変わらない）。
 *
 * `exclusive` でない `check` は cacheDir へ読み書きしないため、占有せず共有パスを指すだけにする。
 */
function prepareViteCacheDir(dataDir: string, imports: readonly string[] | undefined, tempDir: string, exclusive: boolean): PreparedViteCacheDir {
  const shared = resolveViteCacheDir(dataDir, imports ?? []);
  // 既にある場合に備えて realpath 化する（fs.allow の比較が realpath 基準のため）。
  // 未作成なら safeRealpath はパスをそのまま返す。
  if (!exclusive) return { cacheDir: safeRealpath(shared), claim: null };

  const claim = claimViteCacheDir(shared);
  if (claim) return { cacheDir: safeRealpath(claim.dir), claim };

  const fallback = path.join(tempDir, 'vite-cache');
  fs.mkdirSync(fallback, { recursive: true });
  return { cacheDir: fallback, claim: null };
}

/**
 * 生成 config の置き場所を用意する。
 *
 * `cacheDir` と違い、ここは起動直後に書き込むのでディレクトリを作る。
 * 書き込めない場合はプロセス固有の一時ディレクトリへ退避する（キャッシュ再利用を諦めるだけ）。
 */
function prepareGeneratedConfigDir(dataDir: string, imports: readonly string[] | undefined, tempDir: string): string {
  const shared = resolveGeneratedConfigDir(dataDir, imports ?? []);
  try {
    fs.mkdirSync(shared, { recursive: true });
    fs.accessSync(shared, fs.constants.W_OK);
    return safeRealpath(shared);
  } catch {
    return tempDir;
  }
}

/** データディレクトリを検証して `MockupData` を作る。 */
export async function loadMockData(dir: string): Promise<MockupData> {
  const dataDir = resolveDataDir(dir);
  const config = readMockConfig(dataDir);
  const pages = discoverPages(dataDir, config);
  const { tokens, darkTokens } = await loadTokens(dataDir);
  return { dataDir, config, pages, tokens, darkTokens };
}

export interface PrepareMockRuntimeOptions {
  /**
   * 共有 cacheDir を占有してから使う（依存の事前バンドルを書き込む dev 用）。
   * 占有できない場合はプロセス固有の一時ディレクトリへ退避する。
   * 依存の事前バンドルを行わず cacheDir へ書き込まない check（build）では不要。
   */
  exclusiveViteCache?: boolean;
}

/** データディレクトリを検証し、vite を動かすための一時生成物まで用意する。 */
export async function prepareMockRuntime(dir: string, options: PrepareMockRuntimeOptions = {}): Promise<MockupRuntime> {
  const data = await loadMockData(dir);

  // 読み取り専用の配布物（npx キャッシュ等）でも動くよう、生成物はすべて os.tmpdir() 配下へ置く。
  // macOS の os.tmpdir() はシンボリックリンクのため、realpath 化してから使う（fs.allow の比較が realpath 基準）。
  const tempDir = safeRealpath(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-mockup-')));
  // 依存の事前バンドルと生成 config だけは起動間で同じ場所に置く
  // （tempDir とは別。理由は resolveViteCacheDir / resolveGeneratedConfigDir 参照）。
  const { cacheDir, claim } = prepareViteCacheDir(data.dataDir, data.config.imports, tempDir, options.exclusiveViteCache ?? false);

  let configDir: string;
  let configPath: string;
  let tokensCss: string;
  let tokensData: TokenGroupEntry[];
  try {
    configDir = prepareGeneratedConfigDir(data.dataDir, data.config.imports, tempDir);
    configPath = writeConfigModule(configDir, data.tokens);
    const artifacts = await buildTokensArtifacts(data.dataDir, configPath, data.tokens, data.darkTokens);
    tokensCss = artifacts.css;
    tokensData = artifacts.groups;
  } catch (error) {
    // ここで失敗すると runtime を返せず `cleanup()` も呼ばれないため、占有と一時ディレクトリを自分で片付ける
    // （占有を返しておけば、エラー直後に起動し直しても共有キャッシュをそのまま使える）。
    claim?.release();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // 削除できなくても致命的ではない（OS の一時ディレクトリ掃除に任せる）。
    }
    throw error;
  }

  let specifierSource: MockupData['pages'] | null = null;
  let specifiers: ReadonlySet<string> = new Set();

  const runtime: MockupRuntime = {
    data,
    configPath,
    configDir,
    cacheDir,
    tempDir,
    tokensCss,
    tokensData,

    getPageSpecifiers() {
      if (specifierSource !== runtime.data.pages) {
        specifierSource = runtime.data.pages;
        specifiers = new Set(specifierSource.map((page) => toImportSpecifier(page.file)));
      }
      return specifiers;
    },

    refreshPages() {
      const config = readMockConfig(runtime.data.dataDir);
      const pages = discoverPages(runtime.data.dataDir, config);
      runtime.data = { ...runtime.data, config, pages };
    },

    async refreshTokens() {
      const { tokens, darkTokens } = await loadTokens(runtime.data.dataDir);
      // 同じパスへ書き直す（vite の watcher がこのファイルの変更を拾ってモジュールを invalidate する）。
      writeConfigModule(configDir, tokens);
      runtime.data = { ...runtime.data, tokens, darkTokens };
      const { css, groups } = await buildTokensArtifacts(runtime.data.dataDir, configPath, tokens, darkTokens);
      runtime.tokensCss = css;
      runtime.tokensData = groups;
    },

    cleanup() {
      // 占有した cacheDir を共有パスへ返し、次の起動が温まったキャッシュを使えるようにする。
      claim?.release();
      try {
        // 消すのは生成物の一時ディレクトリだけ。cacheDir / configDir は次回起動で事前バンドルを
        // 省くために残す（configDir を消すと同じ入力でも起動ごとに作り直しになり、
        // 同時起動しているもう1つのプロセスの config まで消してしまう）。
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // 削除できなくても致命的ではない（OS の一時ディレクトリ掃除に任せる）。
      }
    },
  };

  return runtime;
}
