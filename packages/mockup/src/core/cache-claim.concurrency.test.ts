/**
 * 実プロセス間の占有競合テスト。
 *
 * 単体テスト（`cache-claim.test.ts`）は同一プロセスで決定的に確かめられる範囲だけを見る。
 * ここでは実際に別 pid の子プロセスを一斉に走らせ、どの実行順でも成り立つ不変条件を確かめる
 * （インターリーブは固定できないので、「勝者がちょうど1つ」「占有ディレクトリが重ならない」
 * 「全員の返却後に残骸が残らない」といった順序に依存しない性質だけをアサートする）。
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, test, vi } from 'vitest';

import { cleanupTempDirs, createTempDir } from '../test-helpers/fixtures.js';

/** 子プロセスは TS のまま実行するため、tsx をローダーとして読み込む（Node 20.19 に型剥がしが無いため）。 */
const HARNESS = fileURLToPath(new URL('../test-helpers/claim-child.ts', import.meta.url));
/** `tsx` を解決できるよう、子プロセスの cwd はパッケージルートにする。 */
const PACKAGE_ROOT = fileURLToPath(new URL('../..', import.meta.url));

/** 子プロセスの数（増やすほど交錯しやすいが、CI の負荷とタイムアウトのリスクも上がる）。 */
const CHILD_COUNT = 3;
const PHASE_TIMEOUT = 30_000;

interface ClaimReport {
  pid: number;
  claimed: boolean;
  dir: string | null;
  marker: string | null;
}

interface Child {
  process: ChildProcess;
  out: string;
  err: string;
  exited: Promise<unknown>;
}

afterAll(() => {
  cleanupTempDirs();
});

function createSharedPath(): string {
  return path.join(createTempDir(), 'lism-mockup-cache-test');
}

/** 確実に死んでいる pid（起動して即終了した子プロセスの pid）。 */
function deadPid(): number {
  const child = spawnSync(process.execPath, ['-e', '']);
  if (child.pid === undefined) throw new Error('failed to spawn a child process');
  return child.pid;
}

function createMarkedDir(dir: string, marker: string): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'marker.txt'), marker, 'utf-8');
}

function readMarker(dir: string): string | null {
  try {
    return fs.readFileSync(path.join(dir, 'marker.txt'), 'utf-8');
  } catch {
    return null;
  }
}

/** 共有パスの隣に残っている占有ディレクトリの名前。 */
function inuseEntries(sharedPath: string): string[] {
  const prefix = `${path.basename(sharedPath)}.inuse.`;
  return fs.readdirSync(path.dirname(sharedPath)).filter((name) => name.startsWith(prefix));
}

function startChild(sharedPath: string, startSignal: string, releaseSignal: string): Child {
  const process_ = spawn(process.execPath, ['--import', 'tsx', HARNESS, sharedPath, startSignal, releaseSignal], {
    cwd: PACKAGE_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const child: Child = { process: process_, out: '', err: '', exited: once(process_, 'exit') };
  process_.stdout?.on('data', (chunk: Buffer) => (child.out += chunk.toString()));
  process_.stderr?.on('data', (chunk: Buffer) => (child.err += chunk.toString()));
  return child;
}

function reportedLines(child: Child): string[] {
  return child.out.split('\n').filter((line) => line.trim() !== '');
}

/** 全子が指定行数を報告するまで待つ（失敗時は stderr も添えて原因を追えるようにする）。 */
async function waitForLines(children: Child[], count: number): Promise<void> {
  try {
    await vi.waitFor(
      () => {
        for (const child of children) expect(reportedLines(child).length).toBeGreaterThanOrEqual(count);
      },
      { timeout: PHASE_TIMEOUT, interval: 20 }
    );
  } catch (error) {
    const detail = children.map((child) => `[pid ${child.process.pid}] out=${JSON.stringify(child.out)} err=${JSON.stringify(child.err)}`).join('\n');
    throw new Error(`child processes did not report ${count} line(s):\n${detail}`, { cause: error });
  }
}

/**
 * 子プロセスを一斉に起動して同時に占有を試させ、全員が返却して終了するまで進める。
 *
 * 起動のばらつきで実質的に競合しなくなるのを防ぐため、全子が待機に入ってから start の合図を出す。
 */
async function raceClaims(sharedPath: string): Promise<ClaimReport[]> {
  const signalDir = createTempDir();
  const startSignal = path.join(signalDir, 'start');
  const releaseSignal = path.join(signalDir, 'release');
  const children = Array.from({ length: CHILD_COUNT }, () => startChild(sharedPath, startSignal, releaseSignal));

  try {
    await waitForLines(children, 1);
    fs.writeFileSync(startSignal, '', 'utf-8');
    await waitForLines(children, 2);
    fs.writeFileSync(releaseSignal, '', 'utf-8');
    await Promise.all(children.map((child) => child.exited));

    return children.map((child) => JSON.parse(reportedLines(child)[1]) as ClaimReport);
  } finally {
    for (const child of children) if (child.process.exitCode === null) child.process.kill('SIGKILL');
  }
}

describe('claimViteCacheDir（実プロセス間の競合）', () => {
  test('共有キャッシュがある状態で同時起動すると、引き継ぐのは1プロセスだけ', async () => {
    const shared = createSharedPath();
    createMarkedDir(shared, 'warm');

    const reports = await raceClaims(shared);

    // 温まったキャッシュを引き継げるのは、共有パスの rename に成功した1つだけ。
    expect(reports.filter((report) => report.marker === 'warm')).toHaveLength(1);
    // 占有できた子の書き込み先は互いに別のディレクトリ（同じ場所へ2つが書くことはない）。
    const claimed = reports.filter((report) => report.claimed);
    for (const report of claimed) expect(report.dir).toBe(`${shared}.inuse.${report.pid}`);
    expect(new Set(claimed.map((report) => report.dir)).size).toBe(claimed.length);
    // 全員の返却後は、キャッシュを保った共有パスだけが残る。
    expect(readMarker(shared)).toBe('warm');
    expect(inuseEntries(shared)).toEqual([]);
  }, 60_000);

  test('キャッシュが無い状態で同時起動すると、各プロセスが別々のディレクトリを持つ', async () => {
    const shared = createSharedPath();

    const reports = await raceClaims(shared);

    const claimed = reports.filter((report) => report.claimed);
    // フレッシュ起動では、共有パスを取れなくても自 pid 名で新規作成して起動を続けられる。
    expect(claimed.length).toBeGreaterThan(0);
    for (const report of claimed) expect(report.dir).toBe(`${shared}.inuse.${report.pid}`);
    expect(new Set(claimed.map((report) => report.dir)).size).toBe(claimed.length);
    // 返却は先勝ちで共有パスへ収束し、負けた側は自分のディレクトリを捨てる。
    expect(fs.existsSync(shared)).toBe(true);
    expect(inuseEntries(shared)).toEqual([]);
  }, 60_000);

  test('同じ残骸を複数プロセスが見つけても、回収できるのは1プロセスだけ', async () => {
    const shared = createSharedPath();
    createMarkedDir(`${shared}.inuse.${deadPid()}`, 'crashed');

    const reports = await raceClaims(shared);

    // 残骸の rename に成功した1つ以外は、回収済みとして退避するか自分のディレクトリを作る。
    expect(reports.filter((report) => report.marker === 'crashed').length).toBeLessThanOrEqual(1);
    const claimed = reports.filter((report) => report.claimed);
    expect(claimed.length).toBeGreaterThan(0);
    for (const report of claimed) expect(report.dir).toBe(`${shared}.inuse.${report.pid}`);
    expect(new Set(claimed.map((report) => report.dir)).size).toBe(claimed.length);
    // 残骸も占有ディレクトリも残らない（回収されるか掃除される）。
    expect(fs.existsSync(shared)).toBe(true);
    expect(inuseEntries(shared)).toEqual([]);
  }, 60_000);
});
