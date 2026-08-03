import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

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
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 1,' });
    expect(() => readMockConfig(dir)).toThrow(/not valid JSON/);
  });

  test('schemaVersion 欠落はエラー（追加すべき内容を案内する）', () => {
    const dir = createDataDir({ 'mockup.config.json': '{}' });
    expect(() => readMockConfig(dir)).toThrow(/missing "schemaVersion".*"schemaVersion": 1/s);
  });

  test('非対応の schemaVersion はエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 2 }' });
    expect(() => readMockConfig(dir)).toThrow(/only supports 1/);
  });

  test('未知のトップレベルキーはエラー（schemaVersion 更新なしの拡張を許さない）', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 1, "variants": [] }' });
    expect(() => readMockConfig(dir)).toThrow(/unknown key\(s\): "variants"/);
  });

  test('pages のメタデータを検証して読み込む', () => {
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({
        schemaVersion: 1,
        title: 'Sample',
        pages: { home: { label: 'Home', category: 'Main', order: 1 } },
      }),
    });

    expect(readMockConfig(dir)).toEqual({
      schemaVersion: 1,
      title: 'Sample',
      pages: { home: { label: 'Home', category: 'Main', order: 1 } },
    });
  });

  test('pages メタデータの未知キー・型違反はエラー', () => {
    const unknownKey = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 1, pages: { home: { icon: 'x' } } }),
    });
    expect(() => readMockConfig(unknownKey)).toThrow(/"pages.home" has unknown key\(s\): "icon"/);

    const badOrder = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 1, pages: { home: { order: '1' } } }),
    });
    expect(() => readMockConfig(badOrder)).toThrow(/"pages.home.order" must be a number/);
  });

  test('pages の予約キーも own key として保持する（検証すり抜け防止）', () => {
    const dir = createDataDir({
      'mockup.config.json': '{ "schemaVersion": 1, "pages": { "__proto__": { "label": "Ghost" }, "home": { "label": "Home" } } }',
    });

    const pages = readMockConfig(dir).pages ?? {};
    expect(Object.getPrototypeOf(pages)).toBe(null);
    expect(Object.keys(pages).sort()).toEqual(['__proto__', 'home']);
    expect(Object.hasOwn(pages, '__proto__')).toBe(true);
    // prototype が差し替わっていないので、実在しないキーは undefined のまま。
    expect(pages.label).toBeUndefined();
  });

  test('トップレベルの __proto__ は未知キーとしてエラー', () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 1, "__proto__": { "title": "x" } }' });
    expect(() => readMockConfig(dir)).toThrow(/unknown key\(s\): "__proto__"/);
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
