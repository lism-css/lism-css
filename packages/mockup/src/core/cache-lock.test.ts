import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { cleanupTempDirs, createTempDir } from '../test-helpers/fixtures.js';
import { acquireCacheDirLock } from './cache-lock.js';

afterAll(() => {
  cleanupTempDirs();
});

/** 確実に死んでいる pid（起動して即終了した子プロセスの pid）。 */
function deadPid(): number {
  const child = spawnSync(process.execPath, ['-e', '']);
  if (child.pid === undefined) throw new Error('failed to spawn a child process');
  return child.pid;
}

describe('acquireCacheDirLock', () => {
  test('取得するとロックファイルに自分の pid が入り、解放すると消えて取り直せる', () => {
    const cacheDir = path.join(createTempDir(), 'cache');

    const lock = acquireCacheDirLock(cacheDir);
    expect(lock).not.toBeNull();
    expect(fs.readFileSync(`${cacheDir}.lock`, 'utf-8')).toBe(String(process.pid));

    lock?.release();
    expect(fs.existsSync(`${cacheDir}.lock`)).toBe(false);

    const again = acquireCacheDirLock(cacheDir);
    expect(again).not.toBeNull();
    again?.release();
    // 2回解放しても無害。
    again?.release();
  });

  test('生きたプロセスが保持している間は取得できない', () => {
    const cacheDir = path.join(createTempDir(), 'cache');
    const lock = acquireCacheDirLock(cacheDir);

    expect(acquireCacheDirLock(cacheDir)).toBeNull();

    lock?.release();
  });

  test('死んだプロセスが残したロックは奪って取得できる', () => {
    const cacheDir = path.join(createTempDir(), 'cache');
    // SIGKILL やクラッシュで release() されずに残ったロックを再現する。
    fs.writeFileSync(`${cacheDir}.lock`, String(deadPid()));

    const lock = acquireCacheDirLock(cacheDir);

    expect(lock).not.toBeNull();
    expect(fs.readFileSync(`${cacheDir}.lock`, 'utf-8')).toBe(String(process.pid));
    lock?.release();
  });

  test('pid を読めないロックは生存扱いにして奪わない', () => {
    const cacheDir = path.join(createTempDir(), 'cache');
    fs.writeFileSync(`${cacheDir}.lock`, 'not-a-pid');

    expect(acquireCacheDirLock(cacheDir)).toBeNull();
    // 中身を壊していない。
    expect(fs.readFileSync(`${cacheDir}.lock`, 'utf-8')).toBe('not-a-pid');
  });

  test('解放時に他プロセスのロックは消さない', () => {
    const cacheDir = path.join(createTempDir(), 'cache');
    const lock = acquireCacheDirLock(cacheDir);
    // 保持中に別プロセスへ奪われた（自分のロックが別の pid に置き換わった）状況を再現する。
    fs.writeFileSync(`${cacheDir}.lock`, String(deadPid()));

    lock?.release();

    expect(fs.existsSync(`${cacheDir}.lock`)).toBe(true);
  });
});
