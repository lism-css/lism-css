import { describe, test, expect } from 'vitest';
import splitWithComma from './splitWithComma';

describe('splitWithComma', () => {
  describe('文字列の処理', () => {
    test('カンマ区切りの文字列を配列に分割', () => {
      expect(splitWithComma('foo,bar,baz')).toEqual(['foo', 'bar', 'baz']);
    });

    test('カンマとスペースで区切られた文字列を分割してトリム', () => {
      expect(splitWithComma('foo, bar, baz')).toEqual(['foo', 'bar', 'baz']);
    });

    test('前後にスペースがある要素をトリム', () => {
      expect(splitWithComma('  foo  ,  bar  ,  baz  ')).toEqual(['foo', 'bar', 'baz']);
    });

    test('単一の文字列（カンマなし）', () => {
      expect(splitWithComma('foo')).toEqual(['foo']);
    });

    test('空文字列は空要素の配列を返す', () => {
      expect(splitWithComma('')).toEqual(['']);
    });

    test('カンマのみの文字列', () => {
      expect(splitWithComma(',')).toEqual(['', '']);
    });

    test('連続したカンマ', () => {
      expect(splitWithComma('foo,,bar')).toEqual(['foo', '', 'bar']);
    });

    test('先頭・末尾のカンマ', () => {
      expect(splitWithComma(',foo,bar,')).toEqual(['', 'foo', 'bar', '']);
    });

    test('スペースのみの要素は空文字列になる', () => {
      expect(splitWithComma('foo,   ,bar')).toEqual(['foo', '', 'bar']);
    });
  });

  describe('配列の処理', () => {
    test('配列をそのまま返す', () => {
      const input = ['foo', 'bar', 'baz'];
      const result = splitWithComma(input);
      expect(result).toEqual(['foo', 'bar', 'baz']);
      expect(result).toBe(input); // 同じ参照
    });

    test('空配列をそのまま返す', () => {
      const input: string[] = [];
      const result = splitWithComma(input);
      expect(result).toEqual([]);
      expect(result).toBe(input);
    });

    test('配列の要素はトリムされない（文字列の場合のみトリム）', () => {
      const input = ['  foo  ', '  bar  '];
      expect(splitWithComma(input)).toBe(input);
      expect(splitWithComma(input)).toEqual(['  foo  ', '  bar  ']);
    });
  });

  describe('特殊なケース', () => {
    test('空白とカンマの複雑な組み合わせ', () => {
      expect(splitWithComma(' , foo , , bar , ')).toEqual(['', 'foo', '', 'bar', '']);
    });
  });
});
