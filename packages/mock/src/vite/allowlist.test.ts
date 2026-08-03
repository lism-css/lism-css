import { describe, expect, test } from 'vitest';

import { getMockPackageRoot } from '../core/paths.js';
import { ALLOWED_PACKAGES, buildImportAllowlist, collectPackageSpecifiers, findPackageDir } from './allowlist.js';

const allowlist = buildImportAllowlist();

describe('collectPackageSpecifiers', () => {
  test('exports のサブパスを実在 specifier へ展開し、ワイルドカードは別枠にする', () => {
    const { statics, wildcards } = collectPackageSpecifiers('lism-css', {
      exports: { '.': {}, './react': {}, './react/*': {}, './*.css': {} },
    });

    expect(statics).toEqual(['lism-css', 'lism-css/react']);
    expect(wildcards).toEqual([
      { prefix: 'lism-css/react/', suffix: '' },
      { prefix: 'lism-css/', suffix: '.css' },
    ]);
  });

  test('条件マップだけの exports はルート `.` の糖衣として扱う', () => {
    const { statics, wildcards } = collectPackageSpecifiers('pkg', { exports: { import: './index.js', require: './index.cjs' } });
    expect(statics).toEqual(['pkg']);
    expect(wildcards).toEqual([]);
  });

  test('exports を持たないパッケージはパッケージ名と任意サブパスを候補にする', () => {
    const { statics, wildcards } = collectPackageSpecifiers('lucide-react', {});
    expect(statics).toEqual(['lucide-react']);
    expect(wildcards).toEqual([{ prefix: 'lucide-react/', suffix: '' }]);
  });
});

describe('findPackageDir', () => {
  test('@lism-css/mock を起点に、対象パッケージがすべて解決できる', () => {
    for (const pkgName of ALLOWED_PACKAGES) {
      expect(findPackageDir(pkgName, getMockPackageRoot())).not.toBeNull();
    }
    expect(allowlist.missingPackages).toEqual([]);
  });
});

describe('buildImportAllowlist', () => {
  test('許可パッケージの実在 specifier は通る', () => {
    for (const specifier of [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'lism-css',
      'lism-css/react',
      'lism-css/lib/getTokenVarName',
      'lism-css/full.css',
      '@lism-css/ui/react',
      '@lism-css/ui/react/Accordion',
      '@lism-css/ui/style.css',
      'lucide-react',
    ]) {
      expect(allowlist.isAllowed(specifier), specifier).toBe(true);
    }
  });

  test('公開されていないサブパスは拒否する', () => {
    // @lism-css/ui は ./react/* のワイルドカードを持たないため、存在しない名前は解決自体が失敗する。
    expect(allowlist.isAllowed('@lism-css/ui/react/NoSuchComponent')).toBe(false);
    // lism-css は ./react/* / ./lib/* のワイルドカードを持つが、実ファイルが無い specifier は許可しない。
    expect(allowlist.isAllowed('lism-css/react/NoSuchComponent')).toBe(false);
    expect(allowlist.isAllowed('lism-css/lib/noSuchHelper')).toBe(false);
    expect(allowlist.isAllowed('@lism-css/ui')).toBe(false);
  });

  test('許可リスト外のパッケージは拒否する（依存ツリーに偶然あるものも含む）', () => {
    expect(allowlist.isAllowed('vite')).toBe(false);
    expect(allowlist.isAllowed('picocolors')).toBe(false);
    expect(allowlist.isAllowed('node:fs')).toBe(false);
    expect(allowlist.isAllowed('some-unknown-package')).toBe(false);
  });

  test('fs.allow 用に許可パッケージの realpath ルートを持つ', () => {
    expect(allowlist.packageRoots).toHaveLength(ALLOWED_PACKAGES.length);
    expect(allowlist.packageRoots.some((root) => root.endsWith('/packages/lism-css'))).toBe(true);
  });
});
