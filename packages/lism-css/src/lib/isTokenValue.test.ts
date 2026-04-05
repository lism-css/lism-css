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

    test('bdrs トークンに存在する値で true を返す', () => {
      expect(isTokenValue('bdrs', '10')).toBe(true);
      expect(isTokenValue('bdrs', '99')).toBe(true);
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

    test('c トークン（オブジェクト形式）に存在する値で true を返す', () => {
      expect(isTokenValue('c', 'base')).toBe(true);
      expect(isTokenValue('c', 'text')).toBe(true);
      expect(isTokenValue('c', 'link')).toBe(true);
    });

    test('palette トークンに存在する値で true を返す', () => {
      expect(isTokenValue('palette', 'red')).toBe(true);
      expect(isTokenValue('palette', 'blue')).toBe(true);
      expect(isTokenValue('palette', 'keycolor')).toBe(true);
    });
  });

  describe('数値の扱い', () => {
    test('数値は文字列化してから判定される', () => {
      // bdrsトークンは文字列の配列だが、数値でも判定できる
      expect(isTokenValue('bdrs', 5)).toBe(true);
      expect(isTokenValue('bdrs', 10)).toBe(true);
      expect(isTokenValue('bdrs', 99)).toBe(true);
    });

    test('存在しない数値は false を返す', () => {
      expect(isTokenValue('bdrs', 999)).toBe(false);
      expect(isTokenValue('bdrs', 0)).toBe(false);
    });

    test('spaceトークンでも数値が使える', () => {
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

  describe('実際の使用例', () => {
    test('フォントサイズのバリデーション', () => {
      // 有効な値
      expect(isTokenValue('fz', 'base')).toBe(true);
      expect(isTokenValue('fz', 'xl')).toBe(true);
      expect(isTokenValue('fz', '2xl')).toBe(true);

      // 無効な値
      expect(isTokenValue('fz', '16px')).toBe(false);
      expect(isTokenValue('fz', 'large')).toBe(false);
    });

    test('カラーのバリデーション', () => {
      // c トークンの値
      expect(isTokenValue('c', 'base')).toBe(true);
      expect(isTokenValue('c', 'text')).toBe(true);

      // palette トークンの値
      expect(isTokenValue('palette', 'red')).toBe(true);
      expect(isTokenValue('palette', 'blue')).toBe(true);

      // 無効な値
      expect(isTokenValue('c', '#ff0000')).toBe(false);
      expect(isTokenValue('palette', 'custom')).toBe(false);
    });

    test('スペースのバリデーション', () => {
      // 有効な値（文字列）
      expect(isTokenValue('space', '10')).toBe(true);
      expect(isTokenValue('space', '20')).toBe(true);

      // 有効な値（数値）
      expect(isTokenValue('space', 10)).toBe(true);
      expect(isTokenValue('space', 20)).toBe(true);

      // 無効な値
      expect(isTokenValue('space', '1rem')).toBe(false);
      expect(isTokenValue('space', 100)).toBe(false);
    });

    test('ボーダー半径のバリデーション', () => {
      expect(isTokenValue('bdrs', '10')).toBe(true);
      expect(isTokenValue('bdrs', '99')).toBe(true);
      expect(isTokenValue('bdrs', 'inner')).toBe(true);

      expect(isTokenValue('bdrs', '1000')).toBe(false);
      expect(isTokenValue('bdrs', '50%')).toBe(false);
    });
  });
});
