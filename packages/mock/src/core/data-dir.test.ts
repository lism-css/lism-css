import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { cleanupTempDirs, createDataDir } from '../test-helpers/fixtures.js';
import { readMockConfig, resolveDataDir } from './data-dir.js';
import { MockContractError } from './types.js';

afterAll(() => {
  cleanupTempDirs();
});

describe('resolveDataDir', () => {
  test('存在しないディレクトリはエラー', () => {
    expect(() => resolveDataDir(path.join(createDataDir({}), 'missing'))).toThrow(/Data directory not found/);
  });

  test('ファイルを指定した場合もエラー', () => {
    const dir = createDataDir({ 'mock.config.json': '{}' });
    expect(() => resolveDataDir(path.join(dir, 'mock.config.json'))).toThrow(/not a directory/);
  });
});

describe('readMockConfig', () => {
  test('mock.config.json が無ければ init を案内してエラー', () => {
    const dir = createDataDir({ 'pages/home.jsx': 'export default () => null;\n' });
    expect(() => readMockConfig(dir)).toThrow(/mock.config.json not found.*lism-mock init/s);
  });

  test('JSON として壊れていればエラー', () => {
    const dir = createDataDir({ 'mock.config.json': '{ "schemaVersion": 1,' });
    expect(() => readMockConfig(dir)).toThrow(/not valid JSON/);
  });

  test('schemaVersion 欠落はエラー（追加すべき内容を案内する）', () => {
    const dir = createDataDir({ 'mock.config.json': '{}' });
    expect(() => readMockConfig(dir)).toThrow(/missing "schemaVersion".*"schemaVersion": 1/s);
  });

  test('非対応の schemaVersion はエラー', () => {
    const dir = createDataDir({ 'mock.config.json': '{ "schemaVersion": 2 }' });
    expect(() => readMockConfig(dir)).toThrow(/only supports 1/);
  });

  test('未知のトップレベルキーはエラー（schemaVersion 更新なしの拡張を許さない）', () => {
    const dir = createDataDir({ 'mock.config.json': '{ "schemaVersion": 1, "variants": [] }' });
    expect(() => readMockConfig(dir)).toThrow(/unknown key\(s\): "variants"/);
  });

  test('pages のメタデータを検証して読み込む', () => {
    const dir = createDataDir({
      'mock.config.json': JSON.stringify({
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
      'mock.config.json': JSON.stringify({ schemaVersion: 1, pages: { home: { icon: 'x' } } }),
    });
    expect(() => readMockConfig(unknownKey)).toThrow(/"pages.home" has unknown key\(s\): "icon"/);

    const badOrder = createDataDir({
      'mock.config.json': JSON.stringify({ schemaVersion: 1, pages: { home: { order: '1' } } }),
    });
    expect(() => readMockConfig(badOrder)).toThrow(/"pages.home.order" must be a number/);
  });

  test('契約違反は MockContractError（対象ファイル付き）で投げる', () => {
    const dir = createDataDir({ 'mock.config.json': '{ "schemaVersion": 9 }' });
    try {
      readMockConfig(dir);
      expect.unreachable('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MockContractError);
      expect((error as MockContractError).file).toBe(path.join(dir, 'mock.config.json'));
    }
  });
});
