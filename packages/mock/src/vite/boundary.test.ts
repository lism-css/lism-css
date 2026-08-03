import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { toImportSpecifier } from '../core/paths.js';
import { MockContractError } from '../core/types.js';
import { cleanupTempDirs, createTempDir, writeFiles } from '../test-helpers/fixtures.js';
import { buildImportAllowlist } from './allowlist.js';
import { classifyImport, type ImportBoundaryContext } from './boundary.js';
import { RESOLVED_VIRTUAL_PAGES_ID } from './virtual-modules.js';

const PAGE = 'export default () => null;\n';

// データディレクトリの「外」を用意するため、一段深い場所をデータディレクトリにする。
const projectDir = createTempDir();
writeFiles(projectDir, {
  'outside.jsx': PAGE,
  'secret.txt': 'secret\n',
  'data/mock.config.json': '{ "schemaVersion": 1 }',
  'data/pages/home.jsx': PAGE,
  'data/pages/admin/users.tsx': PAGE,
  'data/pages/home.css': '.a { color: red; }\n',
  'data/pages/logo.svg': '<svg />',
  'data/components/Card.jsx': PAGE,
  'data/lib/util.js': 'export const a = 1;\n',
});
const dataDir = path.join(projectDir, 'data');
const outsideDir = createTempDir();

const homePage = path.join(dataDir, 'pages/home.jsx');
const usersPage = path.join(dataDir, 'pages/admin/users.tsx');

const ctx: ImportBoundaryContext = {
  dataDir,
  allowlist: buildImportAllowlist(),
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
});

describe('classifyImport: bare import', () => {
  test('許可リストの specifier は @lism-css/mock 起点で解決する', () => {
    expect(classifyImport('lism-css/react', homePage, ctx)).toEqual({ kind: 'bare', specifier: 'lism-css/react' });
    expect(classifyImport('react', homePage, ctx)).toEqual({ kind: 'bare', specifier: 'react' });
    expect(classifyImport('@lism-css/ui/react/Accordion', homePage, ctx)).toEqual({
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

  test('許可外の bare import は契約違反', () => {
    expect(() => classifyImport('lodash', homePage, ctx)).toThrow(/not an allowed package entry/);
    expect(() => classifyImport('vite', homePage, ctx)).toThrow(/not an allowed package entry/);
    expect(() => classifyImport('@lism-css/ui/react/NoSuchComponent', homePage, ctx)).toThrow(/not an allowed package entry/);
  });

  test('エラーメッセージに import 元ファイルと import 内容が入る', () => {
    try {
      classifyImport('lodash', usersPage, ctx);
      expect.unreachable('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MockContractError);
      expect((error as Error).message).toContain('"lodash"');
      expect((error as Error).message).toContain(path.join('pages', 'admin', 'users.tsx'));
      expect((error as MockContractError).file).toBe(usersPage);
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
