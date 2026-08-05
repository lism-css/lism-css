import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { toImportSpecifier } from '../core/paths.js';
import { MockupContractError } from '../core/types.js';
import { cleanupTempDirs, createTempDir, installFakePackage, writeFiles } from '../test-helpers/fixtures.js';
import { buildImportAllowlist } from './allowlist.js';
import { classifyImport, importBoundaryPlugin, type ImportBoundaryContext } from './boundary.js';
import { RESOLVED_VIRTUAL_PAGES_ID } from './virtual-modules.js';

const PAGE = 'export default () => null;\n';

// データディレクトリの「外」を用意するため、一段深い場所をデータディレクトリにする。
const projectDir = createTempDir();
writeFiles(projectDir, {
  'outside.jsx': PAGE,
  'secret.txt': 'secret\n',
  'data/mockup.config.json': '{ "schemaVersion": 2 }',
  'data/pages/home.jsx': PAGE,
  'data/pages/admin/users.tsx': PAGE,
  'data/pages/home.css': '.a { color: red; }\n',
  'data/pages/logo.svg': '<svg />',
  'data/components/Card.jsx': PAGE,
  'data/lib/util.js': 'export const a = 1;\n',
  // データディレクトリがプロジェクト直下に置かれた場合を再現する（node_modules が配下に入る）。
  'data/node_modules/some-dep/index.js': 'export const a = 1;\n',
  'data/node_modules/some-dep/style.css': '.a { color: red; }\n',
  'data/node_modules/some-dep/Comp.jsx': PAGE,
});
installFakePackage(projectDir, 'fake-ui', {
  'package.json': JSON.stringify({ name: 'fake-ui', version: '1.0.0', exports: { '.': './index.js', './button': './button.js' } }),
  'index.js': 'export const a = 1;\n',
  'button.js': 'export const Button = 1;\n',
});
// exports を持たないパッケージ（任意サブパスが許可リストの文字列判定を通る）。
installFakePackage(projectDir, 'fake-plain', {
  'package.json': JSON.stringify({ name: 'fake-plain', version: '1.0.0' }),
  'index.js': 'export const a = 1;\n',
});

const dataDir = path.join(projectDir, 'data');
const outsideDir = createTempDir();

const homePage = path.join(dataDir, 'pages/home.jsx');
const usersPage = path.join(dataDir, 'pages/admin/users.tsx');

const ctx: ImportBoundaryContext = {
  dataDir,
  allowlist: buildImportAllowlist({ dataDir }),
  getPageSpecifiers: () => new Set([toImportSpecifier(homePage), toImportSpecifier(usersPage)]),
};

afterAll(() => {
  cleanupTempDirs();
});

describe('classifyImport: 信頼済みコードからの import', () => {
  test('仮想モジュールが列挙したページは通す', () => {
    expect(classifyImport(toImportSpecifier(homePage), RESOLVED_VIRTUAL_PAGES_ID, ctx)).toEqual({ kind: 'passthrough' });
  });

  test('列挙結果に無いファイルは通さない', () => {
    expect(() => classifyImport(toImportSpecifier(path.join(dataDir, 'components/Card.jsx')), RESOLVED_VIRTUAL_PAGES_ID, ctx)).toThrow(
      /Unexpected import/
    );
  });
});

describe('classifyImport: ユーザーファイル以外', () => {
  test('importer が無い（entry）場合は通常解決', () => {
    expect(classifyImport('/main.js', undefined, ctx)).toEqual({ kind: 'passthrough' });
  });

  test('ビューア側のコードは規則の対象外', () => {
    expect(classifyImport('react', path.join(outsideDir, 'main.jsx'), ctx)).toEqual({ kind: 'passthrough' });
    expect(classifyImport('../anything.js', path.join(outsideDir, 'main.jsx'), ctx)).toEqual({ kind: 'passthrough' });
  });

  test('データディレクトリ配下でも node_modules の中は規則の対象外', () => {
    const dep = path.join(dataDir, 'node_modules/some-dep/index.js');
    expect(classifyImport('./other.js', dep, ctx)).toEqual({ kind: 'passthrough' });
    expect(classifyImport('lodash', dep, ctx)).toEqual({ kind: 'passthrough' });
  });
});

describe('classifyImport: bare import', () => {
  test('許可リストの specifier は @lism-css/mockup 起点で解決する', () => {
    expect(classifyImport('lism-css/react', homePage, ctx)).toMatchObject({
      kind: 'bare',
      specifier: 'lism-css/react',
      resolution: { name: 'lism-css', origin: 'mockup' },
    });
    expect(classifyImport('react', homePage, ctx)).toMatchObject({ kind: 'bare', specifier: 'react' });
    expect(classifyImport('@lism-css/ui/react/Accordion', homePage, ctx)).toMatchObject({
      kind: 'bare',
      specifier: '@lism-css/ui/react/Accordion',
    });
  });

  test('JSX 変換が注入する runtime を誤拒否しない', () => {
    expect(classifyImport('react/jsx-dev-runtime', homePage, ctx)).toMatchObject({ kind: 'bare' });
    // Fast Refresh 等、plugin が注入する vite 内部モジュール
    expect(classifyImport('/@react-refresh', homePage, ctx)).toEqual({ kind: 'passthrough' });
    expect(classifyImport('/@vite/client', homePage, ctx)).toEqual({ kind: 'passthrough' });
    expect(classifyImport('\0some-plugin-virtual', homePage, ctx)).toEqual({ kind: 'passthrough' });
  });

  test('許可外の bare import は契約違反（imports への追加を案内する）', () => {
    expect(() => classifyImport('lodash', homePage, ctx)).toThrow(/not an allowed package entry/);
    expect(() => classifyImport('vite', homePage, ctx)).toThrow(/not an allowed package entry/);
    expect(() => classifyImport('@lism-css/ui/react/NoSuchComponent', homePage, ctx)).toThrow(/not an allowed package entry/);
    expect(() => classifyImport('lodash', homePage, ctx)).toThrow(/add it to "imports" in mockup\.config\.json/);
  });

  test('imports で宣言したパッケージはデータディレクトリ側を起点に解決する', () => {
    const extraCtx: ImportBoundaryContext = { ...ctx, allowlist: buildImportAllowlist({ dataDir, extraPackages: ['fake-ui'] }) };

    expect(classifyImport('fake-ui/button', homePage, extraCtx)).toMatchObject({
      kind: 'bare',
      specifier: 'fake-ui/button',
      resolution: { name: 'fake-ui', origin: 'data' },
    });
    // 宣言していない許可リストでは同じ import が契約違反になる。
    expect(() => classifyImport('fake-ui/button', homePage, ctx)).toThrow(/not an allowed package entry/);
  });

  test('エラーメッセージに import 元ファイルと import 内容が入る', () => {
    try {
      classifyImport('lodash', usersPage, ctx);
      expect.unreachable('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MockupContractError);
      expect((error as Error).message).toContain('"lodash"');
      expect((error as Error).message).toContain(path.join('pages', 'admin', 'users.tsx'));
      expect((error as MockupContractError).file).toBe(usersPage);
    }
  });
});

describe('classifyImport: 相対 import', () => {
  test('データディレクトリ内の .jsx / .css / 画像は許可', () => {
    expect(classifyImport('../components/Card.jsx', homePage, ctx)).toEqual({
      kind: 'resolved',
      id: path.join(dataDir, 'components/Card.jsx'),
    });
    expect(classifyImport('./home.css', homePage, ctx)).toEqual({ kind: 'resolved', id: path.join(dataDir, 'pages/home.css') });
    expect(classifyImport('./logo.svg', homePage, ctx)).toEqual({ kind: 'resolved', id: path.join(dataDir, 'pages/logo.svg') });
  });

  test('拡張子省略は .jsx / .tsx を補って解決する', () => {
    expect(classifyImport('../components/Card', homePage, ctx)).toEqual({
      kind: 'resolved',
      id: path.join(dataDir, 'components/Card.jsx'),
    });
  });

  test('クエリ付き import はクエリを除いたパスに同じ規則を適用する', () => {
    expect(classifyImport('./logo.svg?raw', homePage, ctx)).toEqual({
      kind: 'resolved',
      id: `${path.join(dataDir, 'pages/logo.svg')}?raw`,
    });
    expect(() => classifyImport('../../secret.txt?raw', homePage, ctx)).toThrow(/only .* can be imported with a relative path/);
    expect(() => classifyImport('../../outside.jsx?raw', homePage, ctx)).toThrow(/resolves outside the data directory/);
  });

  test('契約外の拡張子は拒否', () => {
    expect(() => classifyImport('../lib/util.js', homePage, ctx)).toThrow(/only .* can be imported with a relative path/);
  });

  test('`../` でデータディレクトリを脱出する import は拒否（実在ファイルでも）', () => {
    expect(() => classifyImport('../../outside.jsx', homePage, ctx)).toThrow(/resolves outside the data directory/);
    expect(() => classifyImport('../../outside', homePage, ctx)).toThrow(/resolves outside the data directory/);
  });

  test('存在しないファイルは拒否', () => {
    expect(() => classifyImport('./missing.jsx', homePage, ctx)).toThrow(/file not found/);
  });

  test('データディレクトリ配下でも node_modules の中へは入れない（許可拡張子でも）', () => {
    // 宣言していないパッケージのファイルを相対パスで読めないようにする。
    expect(() => classifyImport('../node_modules/some-dep/style.css', homePage, ctx)).toThrow(/relative imports into node_modules are not allowed/);
    expect(() => classifyImport('../node_modules/some-dep/Comp.jsx', homePage, ctx)).toThrow(/relative imports into node_modules are not allowed/);
    expect(() => classifyImport('../node_modules/some-dep/Comp', homePage, ctx)).toThrow(/relative imports into node_modules are not allowed/);
    // 拡張子制限で先に落ちる経路も従来どおり拒否のまま。
    expect(() => classifyImport('../node_modules/some-dep/index.js', homePage, ctx)).toThrow(/can be imported with a relative path/);
  });
});

describe('importBoundaryPlugin: 解決結果の封じ込め', () => {
  const extraCtx: ImportBoundaryContext = { ...ctx, allowlist: buildImportAllowlist({ dataDir, extraPackages: ['fake-ui', 'fake-plain'] }) };
  const fakeUiDir = path.join(projectDir, 'node_modules', 'fake-ui');

  /** vite の解決結果を差し替えて、プラグインの封じ込め判定だけを検証する。 */
  function resolveWith(resolvedId: string | null, source: string, boundaryCtx: ImportBoundaryContext = extraCtx): Promise<unknown> {
    const plugin = importBoundaryPlugin(boundaryCtx);
    const handler = plugin.resolveId as unknown as (
      this: { resolve: () => Promise<{ id: string } | null> },
      source: string,
      importer: string
    ) => Promise<unknown>;
    return handler.call({ resolve: () => Promise.resolve(resolvedId === null ? null : { id: resolvedId }) }, source, homePage);
  }

  test('パッケージ内のファイルへ解決されたものは通す', async () => {
    await expect(resolveWith(path.join(fakeUiDir, 'button.js'), 'fake-ui/button')).resolves.toMatchObject({
      id: path.join(fakeUiDir, 'button.js'),
    });
  });

  test('許可パッケージの外のファイルへ解決されたものは拒否する（拡張子補完でリンクを辿った場合）', async () => {
    // exports の無いパッケージの `fake-plain/escape` は許可リストの文字列判定を通るが、
    // vite が `.js` を補うとパッケージ外を指すシンボリックリンクへ解決しうる。
    expect(extraCtx.allowlist.isAllowed('fake-plain/escape')).toBe(true);

    await expect(resolveWith(path.join(projectDir, 'outside.jsx'), 'fake-plain/escape')).rejects.toThrow(/resolves outside the allowed packages/);
    await expect(resolveWith('/etc/passwd', 'fake-plain/escape')).rejects.toThrow(/resolves outside the allowed packages/);
  });

  test('vite の生成物（依存最適化の出力）は許可する', async () => {
    const generatedDir = createTempDir();
    const optimized = path.join(generatedDir, 'vite-cache/deps/fake-ui.js');
    writeFiles(generatedDir, { 'vite-cache/deps/fake-ui.js': 'export const a = 1;\n' });

    await expect(resolveWith(`${optimized}?v=abc`, 'fake-ui', { ...extraCtx, generatedDir })).resolves.toMatchObject({
      id: `${optimized}?v=abc`,
    });
    // generatedDir を渡していない構成では同じ id を拒否する（許可範囲を広げすぎない）。
    await expect(resolveWith(`${optimized}?v=abc`, 'fake-ui')).rejects.toThrow(/resolves outside the allowed packages/);
  });

  test('仮想モジュール id はファイルパスではないので判定対象外', async () => {
    await expect(resolveWith('\0some-plugin-virtual', 'fake-ui')).resolves.toMatchObject({ id: '\0some-plugin-virtual' });
  });

  test('解決できなかった場合は従来どおり契約エラー', async () => {
    await expect(resolveWith(null, 'fake-ui/button')).rejects.toThrow(/does not exist in the installed version/);
  });
});

describe('classifyImport: 絶対パス・URL', () => {
  test('絶対パスは拒否', () => {
    expect(() => classifyImport('/etc/passwd', homePage, ctx)).toThrow(/absolute paths are not allowed/);
    expect(() => classifyImport(path.join(outsideDir, 'x.jsx'), homePage, ctx)).toThrow(/absolute paths are not allowed/);
  });

  test('/@fs/ の直書きは拒否', () => {
    expect(() => classifyImport(`/@fs${path.join(outsideDir, 'x.jsx')}`, homePage, ctx)).toThrow(/"\/@fs\/" paths are not allowed/);
  });

  test('外部 URL は拒否', () => {
    expect(() => classifyImport('https://example.com/x.js', homePage, ctx)).toThrow(/external URLs cannot be imported/);
    expect(() => classifyImport('data:text/javascript,1', homePage, ctx)).toThrow(/external URLs cannot be imported/);
  });
});
