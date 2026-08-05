import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { cleanupTempDirs, createTempDir } from '../test-helpers/fixtures.js';
import { claimViteCacheDir, type ViteCacheClaim } from './cache-claim.js';

afterAll(() => {
  cleanupTempDirs();
});

/** テストごとに独立した共有パス（親ディレクトリを分けて、他テストの残骸を走査に混ぜない）。 */
function createSharedPath(): string {
  return path.join(createTempDir(), 'lism-mockup-cache-test');
}

/** 確実に死んでいる pid（起動して即終了した子プロセスの pid）。 */
function deadPid(): number {
  const child = spawnSync(process.execPath, ['-e', '']);
  if (child.pid === undefined) throw new Error('failed to spawn a child process');
  return child.pid;
}

/** キャッシュの中身の引き継ぎを追える目印を置いたディレクトリを作る。 */
function createMarkedDir(dir: string, marker: string): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'marker.txt'), marker, 'utf-8');
}

/** ディレクトリが持つ目印（無ければ null）。 */
function readMarker(dir: string): string | null {
  try {
    return fs.readFileSync(path.join(dir, 'marker.txt'), 'utf-8');
  } catch {
    return null;
  }
}

/** 取得できる前提の箇所用（`?.` を並べずに済ませる）。 */
function claimOrFail(sharedPath: string): ViteCacheClaim {
  const claim = claimViteCacheDir(sharedPath);
  if (claim === null) throw new Error(`failed to claim ${sharedPath}`);
  return claim;
}

/** 共有パスの隣に残っている占有ディレクトリの名前。 */
function inuseEntries(sharedPath: string): string[] {
  const prefix = `${path.basename(sharedPath)}.inuse.`;
  return fs.readdirSync(path.dirname(sharedPath)).filter((name) => name.startsWith(prefix));
}

describe('claimViteCacheDir', () => {
  test('自 pid 名のディレクトリを占有し、返却すると共有パスへ戻って次の取得が中身を引き継ぐ', () => {
    const shared = createSharedPath();

    const claim = claimOrFail(shared);
    expect(claim.dir).toBe(`${shared}.inuse.${process.pid}`);
    // 依存の事前バンドルを書き込めるよう、ディレクトリ自体は用意されている。
    expect(fs.existsSync(claim.dir)).toBe(true);
    fs.writeFileSync(path.join(claim.dir, 'marker.txt'), 'warm', 'utf-8');

    claim.release();
    expect(fs.existsSync(claim.dir)).toBe(false);
    expect(readMarker(shared)).toBe('warm');

    const next = claimOrFail(shared);
    expect(readMarker(next.dir)).toBe('warm');
    next.release();
    // 2回以上返却しても無害（共有パスへ戻したキャッシュを壊さない）。
    next.release();
    expect(readMarker(shared)).toBe('warm');
  });

  test('占有中に同じプロセスが取り直そうとしても取得せず、占有中のディレクトリを置換しない', () => {
    const shared = createSharedPath();
    const claim = claimOrFail(shared);
    fs.writeFileSync(path.join(claim.dir, 'marker.txt'), 'held', 'utf-8');
    // フレッシュ同時起動の後に別プロセスが返却した状況（空の共有パスと自分の占有が同時にある）。
    fs.mkdirSync(shared, { recursive: true });

    expect(claimViteCacheDir(shared)).toBeNull();

    // POSIX の rename は空ディレクトリを置換できるため、ガードが無いとここが 'held' でなくなる。
    expect(readMarker(claim.dir)).toBe('held');
    claim.release();
  });

  test('生きた別プロセスが占有している間は取得しない', () => {
    const shared = createSharedPath();
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { stdio: 'ignore' });
    if (child.pid === undefined) throw new Error('failed to spawn a child process');
    try {
      fs.mkdirSync(`${shared}.inuse.${child.pid}`, { recursive: true });

      expect(claimViteCacheDir(shared)).toBeNull();
    } finally {
      child.kill('SIGKILL');
    }
  });

  test('死んだプロセスが残した占有は回収して中身を引き継ぐ', () => {
    const shared = createSharedPath();
    // SIGKILL やクラッシュで返却されずに残った占有を再現する。
    const stale = `${shared}.inuse.${deadPid()}`;
    createMarkedDir(stale, 'crashed');

    const claim = claimOrFail(shared);

    expect(claim.dir).toBe(`${shared}.inuse.${process.pid}`);
    expect(readMarker(claim.dir)).toBe('crashed');
    expect(fs.existsSync(stale)).toBe(false);
    claim.release();
  });

  test('回収しなかった死んだプロセスの残骸は占有後に掃除する', () => {
    const shared = createSharedPath();
    const remains = [`${shared}.inuse.${deadPid()}`, `${shared}.inuse.${deadPid()}`];
    for (const [index, dir] of remains.entries()) createMarkedDir(dir, `crashed-${index}`);

    const claim = claimOrFail(shared);

    // 1つを回収し、残りは消える（占有中のディレクトリだけが残る）。
    expect(inuseEntries(shared)).toEqual([path.basename(claim.dir)]);
    expect(readMarker(claim.dir)).toMatch(/^crashed-/);
    claim.release();
  });

  test('返却時に共有パスが埋まっていたら自分のディレクトリを捨てる', () => {
    const shared = createSharedPath();
    const claim = claimOrFail(shared);
    fs.writeFileSync(path.join(claim.dir, 'marker.txt'), 'mine', 'utf-8');
    // フレッシュ同時起動で別々のディレクトリを持った相手が、先に返却した状況。
    createMarkedDir(shared, 'winner');

    claim.release();

    expect(fs.existsSync(claim.dir)).toBe(false);
    expect(readMarker(shared)).toBe('winner');
  });

  test('`.inuse.<pid>` 形式でない項目は管理対象外として無視する', () => {
    const shared = createSharedPath();
    // pid として解釈できない名前（0 以下や先頭ゼロを含む）は、回収も掃除もしない。
    const ignored = [
      `${shared}.inuse.`,
      `${shared}.inuse.abc`,
      `${shared}.inuse.0`,
      `${shared}.inuse.-1`,
      `${shared}.inuse.007`,
      `${shared}.inuse.1x`,
    ];
    for (const dir of ignored) createMarkedDir(dir, 'not-mine');

    const claim = claimOrFail(shared);

    expect(claim.dir).toBe(`${shared}.inuse.${process.pid}`);
    for (const dir of ignored) expect(readMarker(dir)).toBe('not-mine');
    claim.release();
  });

  test('ファイルシステムのエラーでは例外を投げず取得を諦める', () => {
    // 親をディレクトリとして扱えないので、rename も readdir も ENOTDIR で失敗する。
    const notADir = path.join(createTempDir(), 'not-a-dir');
    fs.writeFileSync(notADir, '', 'utf-8');

    expect(claimViteCacheDir(path.join(notADir, 'cache'))).toBeNull();
  });
});
