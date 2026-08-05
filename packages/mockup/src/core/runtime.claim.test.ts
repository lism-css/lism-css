/**
 * `prepareMockRuntime()` が占有取得後に失敗したときの後始末。
 *
 * この経路は runtime を返せないため `cleanup()` が呼ばれない。占有と一時ディレクトリを
 * その場で片付けないと、エラー直後に起動し直しても共有キャッシュを使えなくなる。
 * `vi.mock` はファイル全体に効くため、他の runtime テストとは別ファイルにしている。
 */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test, vi } from 'vitest';

import { cleanupTempDirs, createDataDir, MOCKUP_CONFIG, PLAIN_PAGE } from '../test-helpers/fixtures.js';
import { prepareMockRuntime, resolveGeneratedConfigDir, resolveViteCacheDir } from './runtime.js';

/** 失敗した瞬間の占有状況（テストが空振りしていないことの確認用）。 */
const failure = vi.hoisted(() => ({ sharedPath: '', inuseEntries: [] as string[] }));

// 占有取得より後に走る処理を失敗させる（tokens.json の不正は loadMockData() が取得前に弾くので使えない）。
vi.mock('./tokens.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./tokens.js')>();
  const nodeFs = await import('node:fs');
  const nodePath = await import('node:path');
  return {
    ...actual,
    buildTokensArtifacts: vi.fn(() => {
      const prefix = `${nodePath.basename(failure.sharedPath)}.inuse.`;
      failure.inuseEntries = nodeFs.readdirSync(nodePath.dirname(failure.sharedPath)).filter((name) => name.startsWith(prefix));
      throw new Error('boom');
    }),
  };
});

afterAll(() => {
  cleanupTempDirs();
});

describe('prepareMockRuntime の例外時', () => {
  test('占有取得後に失敗しても、共有キャッシュを返して一時ディレクトリも残さない', async () => {
    const dataDir = createDataDir({ 'mockup.config.json': MOCKUP_CONFIG, 'pages/home.jsx': PLAIN_PAGE });
    const shared = resolveViteCacheDir(dataDir);
    failure.sharedPath = shared;
    // 前回の起動が残した温かいキャッシュ。
    fs.mkdirSync(shared, { recursive: true });
    fs.writeFileSync(path.join(shared, 'marker.txt'), 'warm', 'utf-8');
    // 一時ディレクトリの後始末を確かめるため、`prepareMockRuntime()` が作るパスを捕まえる。
    const mkdtemp = vi.spyOn(fs, 'mkdtempSync');

    await expect(prepareMockRuntime(dataDir, { exclusiveViteCache: true })).rejects.toThrow('boom');

    // 失敗した時点では共有キャッシュを占有していた（占有前に失敗していたら以降の確認が空振りになる）。
    expect(failure.inuseEntries).toEqual([`${path.basename(shared)}.inuse.${process.pid}`]);
    // 占有が返却され、次の起動がそのまま引き継げる状態に戻っている。
    expect(fs.readFileSync(path.join(shared, 'marker.txt'), 'utf-8')).toBe('warm');
    const prefix = `${path.basename(shared)}.inuse.`;
    expect(fs.readdirSync(path.dirname(shared)).filter((name) => name.startsWith(prefix))).toEqual([]);

    const tempDirs = mkdtemp.mock.results.map((result) => result.value as string);
    expect(tempDirs).toHaveLength(1);
    expect(fs.existsSync(tempDirs[0])).toBe(false);
    mkdtemp.mockRestore();

    // 共有ディレクトリは一時ディレクトリの後片付け対象外なので、テストが作った分はここで消す。
    for (const dir of [shared, resolveGeneratedConfigDir(dataDir)]) fs.rmSync(dir, { recursive: true, force: true });
  });
});
