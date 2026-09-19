import { describe, test, expect } from 'vitest';
import filterEmptyObj from './filterEmptyObj';

describe('filterEmptyObj', () => {
  describe('空の値の削除', () => {
    test('空文字列、null、undefined を同時に削除', () => {
      const input = { a: 'foo', b: '', c: null, d: undefined, e: 'bar' };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 'foo', e: 'bar' });
    });
  });

  describe('0 の扱い', () => {
    test('0 は削除されない', () => {
      const input = { a: 0, b: '', c: 1 };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 0, c: 1 });
    });
  });

  describe('オブジェクトの処理', () => {
    test('空オブジェクトのプロパティを削除', () => {
      const input = { a: 'foo', b: {}, c: 'bar' };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 'foo', c: 'bar' });
    });

    test('ネストしたオブジェクトで空のものを削除', () => {
      const input = {
        a: 'foo',
        b: { x: 1 },
        c: {},
        d: 'bar',
      };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 'foo', b: { x: 1 }, d: 'bar' });
    });

    test('空でないオブジェクトは保持される', () => {
      const input = {
        a: 'foo',
        b: { x: 'test', y: 42 },
      };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 'foo', b: { x: 'test', y: 42 } });
    });
  });

  describe('配列の処理', () => {
    test('空配列は isEmptyObj で空と判定されて削除される', () => {
      const input = { a: 'foo', b: [], c: 'bar' };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 'foo', c: 'bar' });
    });

    test('空でない配列は保持される', () => {
      const input = { a: 'foo', b: [1, 2, 3], c: 'bar' };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: 'foo', b: [1, 2, 3], c: 'bar' });
    });
  });

  describe('真偽値の処理', () => {
    test('false は保持される', () => {
      const input = { a: false, b: '', c: true };
      const result = filterEmptyObj(input);
      expect(result).toEqual({ a: false, c: true });
    });
  });

  describe('非破壊的な動作', () => {
    test('元のオブジェクトを変更しない（非破壊的）', () => {
      const input = { a: 'foo', b: '', c: 'bar' };
      const result = filterEmptyObj(input);
      expect(result).not.toBe(input); // 異なる参照
      expect(input).toEqual({ a: 'foo', b: '', c: 'bar' }); // 元のオブジェクトは変更されない
      expect(result).toEqual({ a: 'foo', c: 'bar' }); // 結果は空の値が除外される
    });

    test('元のオブジェクトのプロパティが保持される', () => {
      const input = { a: 'foo', b: null };
      const result = filterEmptyObj(input);
      expect('b' in input).toBe(true); // 元のオブジェクトには残る
      expect('b' in result).toBe(false); // 結果には含まれない
    });
  });

  describe('複合的なケース', () => {
    test('さまざまな型の値が混在', () => {
      const input = {
        str: 'text',
        emptyStr: '',
        num: 42,
        zero: 0,
        nullVal: null,
        undefinedVal: undefined,
        bool: true,
        falseBool: false,
        arr: [1, 2],
        emptyArr: [],
        obj: { x: 1 },
        emptyObj: {},
      };
      const result = filterEmptyObj(input);
      expect(result).toEqual({
        str: 'text',
        num: 42,
        zero: 0,
        bool: true,
        falseBool: false,
        arr: [1, 2],
        obj: { x: 1 },
      });
    });

    test('すべてが空の値の場合は空オブジェクトを返す', () => {
      const input = { a: '', b: null, c: undefined, d: {} };
      const result = filterEmptyObj(input);
      expect(result).toEqual({});
    });

    test('空オブジェクトを渡すと空オブジェクトを返す', () => {
      const input = {};
      const result = filterEmptyObj(input);
      expect(result).toEqual({});
      expect(result).not.toBe(input); // 非破壊的なので異なる参照
    });
  });
});
