import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { getDataResolveAnchor } from '../core/data-dir.js';
import { getMockPackageRoot, getResolveAnchor } from '../core/paths.js';
import { MockupContractError, STANDARD_PACKAGES } from '../core/types.js';
import { cleanupTempDirs, createTempDir, installFakePackage, writeFiles } from '../test-helpers/fixtures.js';
import { buildImportAllowlist, collectPackageSpecifiers, findPackageDir, findPackageDirIn } from './allowlist.js';

const dataDir = createTempDir();
const allowlist = buildImportAllowlist({ dataDir });

afterAll(() => {
  cleanupTempDirs();
});

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
    const { statics, wildcards } = collectPackageSpecifiers('plain-pkg', {});
    expect(statics).toEqual(['plain-pkg']);
    expect(wildcards).toEqual([{ prefix: 'plain-pkg/', suffix: '' }]);
  });
});

describe('findPackageDir', () => {
  test('@lism-css/mockup を起点に、標準パッケージがすべて解決できる', () => {
    for (const pkgName of STANDARD_PACKAGES) {
      expect(findPackageDir(pkgName, getMockPackageRoot())).not.toBeNull();
    }
    expect(allowlist.missingPackages).toEqual([]);
  });
});

describe('buildImportAllowlist: 標準パッケージ', () => {
  test('実在 specifier は設定なしで通る', () => {
    for (const specifier of [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'lism-css',
      'lism-css/react',
      'lism-css/lib/getTokenVarName',
      'lism-css/main.css',
      '@lism-css/ui/react',
      '@lism-css/ui/react/Accordion',
      '@lism-css/ui/style.css',
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

  test('宣言しない限り lucide-react も拒否する（標準パッケージではない）', () => {
    expect(allowlist.isAllowed('lucide-react')).toBe(false);
    expect(allowlist.allowedPackages).not.toContain('lucide-react');
  });

  test('@lism-css/mockup 起点で解決する', () => {
    expect(allowlist.resolutionFor('lism-css/react')).toEqual({ name: 'lism-css', origin: 'mockup', anchor: getResolveAnchor() });
  });

  test('fs.allow 用に許可パッケージの realpath ルートを持つ', () => {
    expect(allowlist.packageRoots).toHaveLength(STANDARD_PACKAGES.length);
    expect(allowlist.packageRoots.some((root) => root.endsWith(path.join('packages', 'lism-css')))).toBe(true);
    expect(allowlist.dependencyRoots).toEqual([]);
  });

  test('標準パッケージの検索に使った node_modules 一覧を fs.allow 用に持ち回す', () => {
    // 同じ祖先チェーンを config 側でもう一度走らせないための受け渡し。
    expect(allowlist.mockupDependencyRoots).toContain(path.join(getMockPackageRoot(), 'node_modules'));
    expect(findPackageDirIn(allowlist.mockupDependencyRoots, 'lism-css')).not.toBeNull();
    expect(findPackageDirIn(allowlist.mockupDependencyRoots, 'no-such-package-anywhere')).toBeNull();
  });
});

describe('buildImportAllowlist: imports で宣言した追加パッケージ', () => {
  const projectDir = createTempDir();
  const projectDataDir = path.join(projectDir, 'mockup');
  writeFiles(projectDir, { 'outside.js': 'export const secret = 1;\n' });
  installFakePackage(projectDir, 'fake-ui', {
    'package.json': JSON.stringify({ name: 'fake-ui', version: '1.0.0', exports: { '.': './index.js', './button': './button.js' } }),
    'index.js': 'export const a = 1;\n',
    'button.js': 'export const Button = 1;\n',
  });
  // exports の無いパッケージ（任意サブパスがワイルドカード許可になる）。
  installFakePackage(projectDir, 'fake-plain', {
    'package.json': JSON.stringify({ name: 'fake-plain', version: '1.0.0' }),
    'icons/star.js': 'export const Star = 1;\n',
  });
  const extra = buildImportAllowlist({ dataDir: projectDataDir, extraPackages: ['fake-ui'] });

  test('宣言したパッケージの exports エントリを許可する', () => {
    expect(extra.isAllowed('fake-ui')).toBe(true);
    expect(extra.isAllowed('fake-ui/button')).toBe(true);
    expect(extra.isAllowed('fake-ui/secret')).toBe(false);
  });

  test('標準パッケージは宣言しなくても引き続き通る', () => {
    expect(extra.isAllowed('react')).toBe(true);
    expect(extra.isAllowed('lism-css/react')).toBe(true);
  });

  test('データディレクトリ側のアンカーから解決する', () => {
    expect(extra.resolutionFor('fake-ui/button')).toEqual({
      name: 'fake-ui',
      origin: 'data',
      anchor: getDataResolveAnchor(projectDataDir),
    });
  });

  test('fs.allow 用にパッケージルートとプロジェクト側の node_modules を足す', () => {
    expect(extra.packageRoots).toHaveLength(STANDARD_PACKAGES.length + 1);
    expect(extra.packageRoots).toContain(path.join(projectDir, 'node_modules', 'fake-ui'));
    expect(extra.dependencyRoots).toContain(path.join(projectDir, 'node_modules'));
  });

  test('エラーメッセージ用に許可パッケージ名を持つ', () => {
    expect(extra.allowedPackages).toEqual([...STANDARD_PACKAGES, 'fake-ui']);
  });

  test('未インストールのパッケージは契約エラー（インストール方法を案内する）', () => {
    try {
      buildImportAllowlist({ dataDir: projectDataDir, extraPackages: ['not-installed-anywhere'] });
      expect.unreachable('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MockupContractError);
      expect((error as Error).message).toMatch(/not installed: "not-installed-anywhere"/);
      expect((error as Error).message).toContain('npm install not-installed-anywhere');
      expect((error as MockupContractError).file).toBe(path.join(projectDataDir, 'mockup.config.json'));
    }
  });

  test('仮想パッケージ（lucide-react）は init 直後でも解決できる', () => {
    const bundled = buildImportAllowlist({ dataDir, extraPackages: ['lucide-react'] });
    expect(bundled.isAllowed('lucide-react')).toBe(true);
    expect(bundled.resolutionFor('lucide-react')).toEqual({ name: 'lucide-react', origin: 'mockup', anchor: getResolveAnchor() });
    // 同梱側で解決できた場合はプロジェクト側の node_modules を開ける必要がない。
    expect(bundled.dependencyRoots).toEqual([]);
    // ディスク上に実体を持たないので fs.allow へ足すルートも増えない。
    expect(bundled.packageRoots).toHaveLength(STANDARD_PACKAGES.length);
  });

  test('仮想パッケージは仮想モジュールが供給するルートだけを許可する（サブパスは不可）', () => {
    const bundled = buildImportAllowlist({ dataDir, extraPackages: ['lucide-react'] });
    expect(bundled.isAllowed('lucide-react/icons/bell')).toBe(false);
    expect(bundled.isAllowed('lucide-react/dist/esm/icons/bell.js')).toBe(false);
  });

  test('プロジェクト側に lucide-react があっても仮想パッケージとして扱う', () => {
    // vite プラグインが必ず仮想モジュールへ解決するため、許可リストも同じ判断へ揃える。
    installFakePackage(projectDir, 'lucide-react', {
      'package.json': JSON.stringify({ name: 'lucide-react', version: '0.0.0-fake' }),
      'index.js': 'export const Bell = 1;\n',
    });
    const installed = buildImportAllowlist({ dataDir: projectDataDir, extraPackages: ['lucide-react'] });

    expect(installed.resolutionFor('lucide-react')).toEqual({ name: 'lucide-react', origin: 'mockup', anchor: getResolveAnchor() });
    expect(installed.packageRoots).not.toContain(path.join(projectDir, 'node_modules', 'lucide-react'));
    expect(installed.dependencyRoots).toEqual([]);
  });

  test('仮想パッケージ以外の CLI 依存は、プロジェクト側に未インストールならフォールバックせず契約エラーになる', () => {
    // vite / picocolors は @lism-css/mockup 自身の依存だが、宣言だけで使えるのは仮想パッケージだけ。
    for (const name of ['vite', 'picocolors']) {
      expect(() => buildImportAllowlist({ dataDir: projectDataDir, extraPackages: [name] }), name).toThrow(/not installed: /);
    }
  });

  test('exports の無いパッケージでも `.` / `..` セグメントで宣言外へ抜けられない', () => {
    const plain = buildImportAllowlist({ dataDir: projectDataDir, extraPackages: ['fake-plain'] });
    expect(plain.isAllowed('fake-plain')).toBe(true);
    expect(plain.isAllowed('fake-plain/icons/star.js')).toBe(true);
    // 宣言していない同階層パッケージへの traversal
    expect(plain.isAllowed('fake-plain/../fake-ui')).toBe(false);
    expect(plain.isAllowed('fake-plain/../fake-ui/index.js')).toBe(false);
    // node_modules 外のファイルへの traversal
    expect(plain.isAllowed('fake-plain/../../outside.js')).toBe(false);
    expect(plain.isAllowed('fake-plain/..')).toBe(false);
    expect(plain.isAllowed('fake-plain/./icons/star.js')).toBe(false);
    expect(plain.isAllowed('fake-plain\\..\\..\\outside.js')).toBe(false);
  });

  test('パッケージ内のシンボリックリンクがパッケージ外を指す場合は拒否する', () => {
    fs.symlinkSync(path.join(projectDir, 'outside.js'), path.join(projectDir, 'node_modules', 'fake-plain', 'escape.js'));
    const plain = buildImportAllowlist({ dataDir: projectDataDir, extraPackages: ['fake-plain'] });
    expect(plain.isAllowed('fake-plain/escape.js')).toBe(false);
  });

  test('仮想パッケージでも `..` セグメントは拒否する', () => {
    const bundled = buildImportAllowlist({ dataDir, extraPackages: ['lucide-react'] });
    expect(bundled.isAllowed('lucide-react/../react')).toBe(false);
    expect(bundled.isAllowed('lucide-react/../../outside.js')).toBe(false);
  });
});
