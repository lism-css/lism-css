import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { cleanupTempDirs, createDataDir, createTempDir } from '../test-helpers/fixtures.js';
import { discoverPages, sortPages } from './pages.js';
import type { MockConfigFile, PageEntry } from './types.js';

const CONFIG: MockConfigFile = { schemaVersion: 1 };
const PAGE = 'export default () => null;\n';

afterAll(() => {
  cleanupTempDirs();
});

describe('discoverPages', () => {
  test('pages/ が無ければ分かりやすいエラーで停止する', () => {
    const dir = createDataDir({ 'mock.config.json': '{}' });
    expect(() => discoverPages(dir, CONFIG)).toThrow(/"pages\/" directory not found/);
  });

  test('pages/ が空ならエラー', () => {
    const dir = createTempDir();
    fs.mkdirSync(path.join(dir, 'pages'));
    expect(() => discoverPages(dir, CONFIG)).toThrow(/No pages found/);
  });

  test('サブディレクトリを含めて再帰的に列挙し、拡張子を除いた相対パスを id にする', () => {
    const dir = createDataDir({
      'pages/home.jsx': PAGE,
      'pages/about.tsx': PAGE,
      'pages/admin/users.jsx': PAGE,
      'pages/readme.md': '# not a page\n',
    });

    expect(discoverPages(dir, CONFIG).map((page) => page.id)).toEqual(['about', 'admin/users', 'home']);
  });

  test('同名の .jsx / .tsx は id 衝突としてエラー', () => {
    const dir = createDataDir({ 'pages/home.jsx': PAGE, 'pages/home.tsx': PAGE });
    expect(() => discoverPages(dir, CONFIG)).toThrow(/Duplicate page id "home"/);
  });

  test('mock.config.json のメタデータをマージする', () => {
    const dir = createDataDir({ 'pages/home.jsx': PAGE });
    const config: MockConfigFile = { schemaVersion: 1, pages: { home: { label: 'Top', category: 'Main', order: 2 } } };

    expect(discoverPages(dir, config)[0]).toMatchObject({ id: 'home', label: 'Top', category: 'Main', order: 2 });
  });

  test('ラベル未指定なら id をラベルにする', () => {
    const dir = createDataDir({ 'pages/admin/users.jsx': PAGE });
    expect(discoverPages(dir, CONFIG)[0]).toMatchObject({ id: 'admin/users', label: 'admin/users' });
  });

  test('実在しない pageId を参照していればエラー', () => {
    const dir = createDataDir({ 'pages/home.jsx': PAGE });
    const config: MockConfigFile = { schemaVersion: 1, pages: { dashboard: { label: 'Dashboard' } } };

    expect(() => discoverPages(dir, config)).toThrow(/references an unknown page id "dashboard"/);
  });

  test('実在しない pageId が __proto__ でもエラー（prototype 由来キーで検証を抜けない）', () => {
    const dir = createDataDir({ 'pages/home.jsx': PAGE });
    const config = { schemaVersion: 1, pages: JSON.parse('{ "__proto__": { "label": "Ghost" } }') } as MockConfigFile;

    expect(() => discoverPages(dir, config)).toThrow(/references an unknown page id "__proto__"/);
  });

  test('page id が prototype のプロパティ名でもメタデータを取り違えない', () => {
    const dir = createDataDir({ 'pages/toString.jsx': PAGE, 'pages/constructor.jsx': PAGE });

    expect(discoverPages(dir, CONFIG).map((page) => ({ id: page.id, label: page.label }))).toEqual([
      { id: 'constructor', label: 'constructor' },
      { id: 'toString', label: 'toString' },
    ]);
  });

  test('__proto__ という page id のメタデータを正しくマージする', () => {
    const dir = createDataDir({ 'pages/__proto__.jsx': PAGE });
    const config = { schemaVersion: 1, pages: JSON.parse('{ "__proto__": { "label": "Proto", "order": 1 } }') } as MockConfigFile;

    expect(discoverPages(dir, config)[0]).toMatchObject({ id: '__proto__', label: 'Proto', order: 1 });
  });

  test('pages/ 内のシンボリックリンクでデータディレクトリ外は参照できない', () => {
    const outside = createTempDir();
    fs.writeFileSync(path.join(outside, 'secret.jsx'), PAGE, 'utf-8');
    const dir = createDataDir({ 'pages/home.jsx': PAGE });
    fs.symlinkSync(path.join(outside, 'secret.jsx'), path.join(dir, 'pages', 'leak.jsx'));

    expect(() => discoverPages(dir, CONFIG)).toThrow(/resolves outside the data directory/);
  });
});

describe('sortPages', () => {
  test('order 昇順 → id 辞書順（order 未指定は末尾）', () => {
    const pages: PageEntry[] = [
      { id: 'b', file: '/b.jsx', label: 'b' },
      { id: 'a', file: '/a.jsx', label: 'a' },
      { id: 'z', file: '/z.jsx', label: 'z', order: 1 },
      { id: 'y', file: '/y.jsx', label: 'y', order: 0 },
    ];

    expect(sortPages(pages).map((page) => page.id)).toEqual(['y', 'z', 'a', 'b']);
  });
});
