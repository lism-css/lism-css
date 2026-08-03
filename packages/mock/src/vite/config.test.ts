import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { getMockPackageRoot } from '../core/paths.js';
import { cleanupTempDirs, createTempDir } from '../test-helpers/fixtures.js';
import { buildImportAllowlist } from './allowlist.js';
import { collectFsAllowRoots } from './config.js';

afterAll(() => {
  cleanupTempDirs();
});

describe('collectFsAllowRoots', () => {
  const allowlist = buildImportAllowlist();
  const dataDir = createTempDir();
  const tempDir = createTempDir();
  const viewerDir = path.join(getMockPackageRoot(), 'viewer');
  const roots = collectFsAllowRoots({ viewerDir, dataDir, tempDir, allowlist });

  test('ビューア・データディレクトリ・生成物の一時ディレクトリを許可する', () => {
    expect(roots).toContain(viewerDir);
    expect(roots).toContain(dataDir);
    expect(roots).toContain(tempDir);
  });

  test('@lism-css/mock が所有する依存ツリーを許可する（workspace リンク先も含む）', () => {
    expect(roots).toContain(path.join(getMockPackageRoot(), 'node_modules'));
    for (const packageRoot of allowlist.packageRoots) {
      expect(roots).toContain(packageRoot);
    }
  });

  test('無関係なディレクトリは許可しない', () => {
    const unrelated = createTempDir();
    expect(roots).not.toContain(unrelated);
    expect(roots).not.toContain('/etc');
    expect(roots.some((root) => root === '/')).toBe(false);
  });
});
