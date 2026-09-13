import { describe, test, expect } from 'vitest';
import isTokenValue from './isTokenValue';

describe('isTokenValue', () => {
  describe('基本的な動作', () => {
    test('TOKENS に tokenKey が存在しない場合、false を返す', () => {
      expect(isTokenValue('notfound', 'value')).toBe(false);
    });
  });

  describe('実在するトークンでの動作', () => {
    test('fz トークン（配列形式）に存在する値で true を返す', () => {
      expect(isTokenValue('fz', 'base')).toBe(true);
      expect(isTokenValue('fz', 'xl')).toBe(true);
      expect(isTokenValue('fz', '2xl')).toBe(true);
    });

    test('fz トークンに存在しない値で false を返す', () => {
      expect(isTokenValue('fz', 'notfound')).toBe(false);
      expect(isTokenValue('fz', 'xxxl')).toBe(false);
    });

    test('space トークン（オブジェクト形式）に存在する値で true を返す', () => {
      expect(isTokenValue('space', '10')).toBe(true);
      expect(isTokenValue('space', '20')).toBe(true);
      expect(isTokenValue('space', '50')).toBe(true);
    });

    test('space トークンに存在しない値で false を返す', () => {
      expect(isTokenValue('space', '100')).toBe(false);
      expect(isTokenValue('space', 'xs')).toBe(false);
    });
  });

  describe('数値の扱い', () => {
    test('数値は文字列化してから判定される', () => {
      expect(isTokenValue('space', 10)).toBe(true);
      expect(isTokenValue('space', 20)).toBe(true);
      expect(isTokenValue('space', 100)).toBe(false);
    });
  });

  describe('エッジケース', () => {
    test('空文字列の値', () => {
      expect(isTokenValue('fz', '')).toBe(false);
      expect(isTokenValue('space', '')).toBe(false);
    });

    test('0 の値', () => {
      expect(isTokenValue('fz', 0)).toBe(false);
      expect(isTokenValue('fz', '0')).toBe(false);
    });

    test('null/undefined の値', () => {
      expect(isTokenValue('fz', null)).toBe(false);
      expect(isTokenValue('fz', undefined)).toBe(false);
    });
  });
});
