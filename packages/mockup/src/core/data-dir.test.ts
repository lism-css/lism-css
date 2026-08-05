import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test, vi } from 'vitest';

import { cleanupTempDirs, createDataDir } from '../test-helpers/fixtures.js';
import { readMockConfig, resolveDataDir } from './data-dir.js';
import { MockupContractError } from './types.js';

afterAll(() => {
  cleanupTempDirs();
});

describe('resolveDataDir', () => {
  test('存在しないディレクトリはエラー', () => {
    expect(() => resolveDataDir(path.join(createDataDir({}), 'missing'))).toThrow(/Data directory not found/);
  });

  test('ファイルを指定した場合もエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': '{}' });
    expect(() => resolveDataDir(path.join(dir, 'mockup.config.json'))).toThrow(/not a directory/);
  });
});

describe('readMockConfig', () => {
  test('mockup.config.json が無ければ init を案内してエラー', () => {
    const dir = createDataDir({ 'pages/home.jsx': 'export default () => null;\n' });
    expect(() => readMockConfig(dir)).toThrow(/mockup.config.json not found.*lism-mockup init/s);
  });

  test('JSON として壊れていればエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 2,' });
    expect(() => readMockConfig(dir)).toThrow(/not valid JSON/);
  });

  test('schemaVersion 欠落はエラー（追加すべき内容を案内する）', () => {
    const dir = createDataDir({ 'mockup.config.json': '{}' });
    expect(() => readMockConfig(dir)).toThrow(/missing "schemaVersion".*"schemaVersion": 2/s);
  });

  test('非対応の schemaVersion はエラー（更新すべき値を案内する）', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 1 }' });
    expect(() => readMockConfig(dir)).toThrow(/only supports 2.*Update it to 2/s);
  });

  test('未知のトップレベルキーはエラー（schemaVersion 更新なしの拡張を許さない）', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 2, "variants": [] }' });
    expect(() => readMockConfig(dir)).toThrow(/unknown key\(s\): "variants"/);
  });

  test('pages のメタデータを検証して読み込む', () => {
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({
        schemaVersion: 2,
        title: 'Sample',
        pages: { home: { label: 'Home', category: 'Main', order: 1 } },
      }),
    });

    expect(readMockConfig(dir)).toEqual({
      schemaVersion: 2,
      title: 'Sample',
      pages: { home: { label: 'Home', category: 'Main', order: 1 } },
    });
  });

  test('imports は追加パッケージ名の配列として読み込む', () => {
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['lucide-react', '@base-ui/react'] }),
    });

    expect(readMockConfig(dir).imports).toEqual(['lucide-react', '@base-ui/react']);
  });

  test('imports が配列でなければエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: 'lucide-react' }) });
    expect(() => readMockConfig(dir)).toThrow(/"imports" must be an array of package names/);
  });

  test('imports の要素はパッケージ名のみ（サブパス・パス・空文字は不可）', () => {
    for (const entry of ['lucide-react/icons', './local', '/abs/path', 'https://example.com/x.js', 'node:fs', 'UPPER']) {
      const dir = createDataDir({ 'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: [entry] }) });
      expect(() => readMockConfig(dir), entry).toThrow(/is not a package name/);
    }

    const empty = createDataDir({ 'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: [''] }) });
    expect(() => readMockConfig(empty)).toThrow(/must only contain non-empty package names/);

    const notString = createDataDir({ 'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: [1] }) });
    expect(() => readMockConfig(notString)).toThrow(/must only contain non-empty package names/);
  });

  test('imports に標準パッケージを書くのはエラー（常時許可されるため）', () => {
    const dir = createDataDir({ 'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['react'] }) });
    expect(() => readMockConfig(dir)).toThrow(/must not contain "react".*always available/s);
  });

  test('imports の重複はエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['lucide-react', 'lucide-react'] }) });
    expect(() => readMockConfig(dir)).toThrow(/lists "lucide-react" more than once/);
  });

  test('pages メタデータの未知キー・型違反はエラー', () => {
    const unknownKey = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, pages: { home: { icon: 'x' } } }),
    });
    expect(() => readMockConfig(unknownKey)).toThrow(/"pages.home" has unknown key\(s\): "icon"/);

    const badOrder = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, pages: { home: { order: '1' } } }),
    });
    expect(() => readMockConfig(badOrder)).toThrow(/"pages.home.order" must be a number/);
  });

  test('pages の予約キーも own key として保持する（検証すり抜け防止）', () => {
    const dir = createDataDir({
      'mockup.config.json': '{ "schemaVersion": 2, "pages": { "__proto__": { "label": "Ghost" }, "home": { "label": "Home" } } }',
    });

    const pages = readMockConfig(dir).pages ?? {};
    expect(Object.getPrototypeOf(pages)).toBe(null);
    expect(Object.keys(pages).sort()).toEqual(['__proto__', 'home']);
    expect(Object.hasOwn(pages, '__proto__')).toBe(true);
    // prototype が差し替わっていないので、実在しないキーは undefined のまま。
    expect(pages.label).toBeUndefined();
  });

  test('トップレベルの __proto__ は未知キーとしてエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 2, "__proto__": { "title": "x" } }' });
    expect(() => readMockConfig(dir)).toThrow(/unknown key\(s\): "__proto__"/);
  });

  test('ENOENT 以外の読み込みエラー（権限エラー等）は「無い」扱いにせず、そのまま投げる', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 2 }' });
    const eacces = Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    const spy = vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw eacces;
    });
    try {
      expect(() => readMockConfig(dir)).toThrow(eacces);
    } finally {
      spy.mockRestore();
    }
  });

  test('契約違反は MockupContractError（対象ファイル付き）で投げる', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 9 }' });
    try {
      readMockConfig(dir);
      expect.unreachable('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MockupContractError);
      expect((error as MockupContractError).file).toBe(path.join(dir, 'mockup.config.json'));
    }
  });
});
