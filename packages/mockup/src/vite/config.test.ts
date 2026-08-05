import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { getMockPackageRoot } from '../core/paths.js';
import { cleanupTempDirs, createTempDir, installFakePackage } from '../test-helpers/fixtures.js';
import { buildImportAllowlist } from './allowlist.js';
import { collectFsAllowRoots } from './config.js';

afterAll(() => {
  cleanupTempDirs();
});

describe('collectFsAllowRoots', () => {
  const dataDir = createTempDir();
  const allowlist = buildImportAllowlist({ dataDir });
  const tempDir = createTempDir();
  const cacheDir = createTempDir();
  const configDir = createTempDir();
  const viewerDir = path.join(getMockPackageRoot(), 'viewer');
  const roots = collectFsAllowRoots({ viewerDir, dataDir, tempDir, cacheDir, configDir, allowlist });

  test('ビューア・データディレクトリ・生成物の一時ディレクトリを許可する', () => {
    expect(roots).toContain(viewerDir);
    expect(roots).toContain(dataDir);
    expect(roots).toContain(tempDir);
  });

  test('依存キャッシュ（cacheDir）と生成 config（configDir）も許可する（tempDir の外にあるため個別に必要）', () => {
    // 事前バンドル済みの依存と生成 config は dev でこれらのディレクトリから配信される。
    // 一時ディレクトリ配下ではないので、含めないと fs.strict に弾かれる。
    expect(roots).toContain(cacheDir);
    expect(roots).toContain(configDir);
    expect(cacheDir.startsWith(tempDir)).toBe(false);
    expect(configDir.startsWith(tempDir)).toBe(false);
  });

  test('@lism-css/mockup が所有する依存ツリーを許可する（workspace リンク先も含む）', () => {
    expect(roots).toContain(path.join(getMockPackageRoot(), 'node_modules'));
    for (const packageRoot of allowlist.packageRoots) {
      expect(roots).toContain(packageRoot);
    }
  });

  test('imports の追加パッケージを解決したプロジェクトの node_modules も許可する', () => {
    const projectDir = createTempDir();
    const projectDataDir = path.join(projectDir, 'mockup');
    installFakePackage(projectDir, 'fake-ui', {
      'package.json': JSON.stringify({ name: 'fake-ui', version: '1.0.0' }),
      'index.js': 'export const a = 1;\n',
    });

    const extra = buildImportAllowlist({ dataDir: projectDataDir, extraPackages: ['fake-ui'] });
    const extraRoots = collectFsAllowRoots({ viewerDir, dataDir: projectDataDir, tempDir, cacheDir, configDir, allowlist: extra });

    expect(extraRoots).toContain(path.join(projectDir, 'node_modules'));
    expect(roots).not.toContain(path.join(projectDir, 'node_modules'));
  });

  test('無関係なディレクトリは許可しない', () => {
    const unrelated = createTempDir();
    expect(roots).not.toContain(unrelated);
    expect(roots).not.toContain('/etc');
    expect(roots.some((root) => root === '/')).toBe(false);
  });
});
