// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { watchLismConfig, type ConfigWatcher } from './config-watcher';

const dirs: string[] = [];
const watchers: ConfigWatcher[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-watch-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => {
  watchers.forEach((w) => w.close());
  dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
});

/** predicate が true になるまで（or timeout まで）ポーリングして待つ。fs.watch は非同期なため。 */
async function waitFor(predicate: () => boolean, timeoutMs = 3000, intervalMs = 20): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return predicate();
}

/**
 * macOS の FSEvents は遅延配信のため、watch 開始直前に書いた config 自身の作成イベントが watch 窓へ漏れる
 * ことがある（実 dev では config は起動時に既存なので起きない、テスト固有の事象）。
 * 起動直後のエコーを drain してからカウンタを 0 に戻すことで、その後の変更だけを判定対象にする。
 */
async function settle(): Promise<void> {
  await new Promise((r) => setTimeout(r, 250));
}

describe('watchLismConfig', () => {
  test('監視対象の変更で onChange が呼ばれる', async () => {
    const root = tmpDir();
    const configPath = path.join(root, 'lism.config.js');
    fs.writeFileSync(configPath, 'export default {};\n');

    let calls = 0;
    const watcher = watchLismConfig({
      configPath,
      onChange: () => {
        calls++;
        return Promise.resolve();
      },
      debounceMs: 10,
    });
    watchers.push(watcher);
    await settle();
    calls = 0;

    fs.writeFileSync(configPath, 'export default { foo: 1 };\n');
    expect(await waitFor(() => calls > 0)).toBe(true);
  });

  test('同一ディレクトリの無関係なファイル変更では onChange を呼ばない', async () => {
    const root = tmpDir();
    const configPath = path.join(root, 'lism.config.js');
    fs.writeFileSync(configPath, 'export default {};\n');

    let calls = 0;
    const watcher = watchLismConfig({
      configPath,
      onChange: () => {
        calls++;
        return Promise.resolve();
      },
      debounceMs: 10,
    });
    watchers.push(watcher);
    await settle();
    calls = 0;

    fs.writeFileSync(path.join(root, 'other.js'), 'noop\n');
    // 取りこぼし検知のため十分待ってから 0 回を確認する。
    await new Promise((r) => setTimeout(r, 250));
    expect(calls).toBe(0);
  });

  test('close() 後は変更で呼ばれない', async () => {
    const root = tmpDir();
    const configPath = path.join(root, 'lism.config.js');
    fs.writeFileSync(configPath, 'export default {};\n');

    let calls = 0;
    const watcher = watchLismConfig({
      configPath,
      onChange: () => {
        calls++;
        return Promise.resolve();
      },
      debounceMs: 10,
    });
    watcher.close();

    fs.writeFileSync(configPath, 'export default { foo: 1 };\n');
    await new Promise((r) => setTimeout(r, 250));
    expect(calls).toBe(0);
  });
});
