import { describe, test, expect } from 'vitest';
import getMaybeTokenValue from './getMaybeTokenValue';

describe('getMaybeTokenValue', () => {
  describe('基本的な動作', () => {
    test('TOKENS に tokenKey が存在しない場合、値をそのまま返す', () => {
      const TOKENS = { foo: new Set(['bar']) };
      expect(getMaybeTokenValue('notfound', 'value', TOKENS)).toBe('value');
    });
  });

  describe('Set 形式の tokenValues', () => {
    test('値が Set に含まれる場合、CSS変数を返す', () => {
      const TOKENS = {
        space: new Set(['10', '20', '30']),
      };
      // space は TOKEN_VAR_PREFIX 登録（--s）
      expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('var(--s10)');
      expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--s20)');
    });

    test('値が Set に含まれない場合、値をそのまま返す', () => {
      const TOKENS = {
        space: new Set(['10', '20']),
      };
      expect(getMaybeTokenValue('space', '40', TOKENS)).toBe('40');
    });

    test('数値は文字列化してから判定される', () => {
      const TOKENS = {
        size: new Set(['10', '20', '30']),
      };
      // size は TOKEN_VAR_PREFIX 未登録 → 既定形式 --size--{key}
      expect(getMaybeTokenValue('size', 10, TOKENS)).toBe('var(--size--10)');
      expect(getMaybeTokenValue('size', 20, TOKENS)).toBe('var(--size--20)');
    });
  });

  describe('Array 形式の tokenValues', () => {
    test('値が配列に含まれる場合、CSS変数を返す', () => {
      const TOKENS = {
        space: ['10', '20', '30'],
      };
      expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('var(--s10)');
      expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--s20)');
    });

    test('値が配列に含まれない場合、値をそのまま返す', () => {
      const TOKENS = {
        space: ['10', '20'],
      };
      expect(getMaybeTokenValue('space', '40', TOKENS)).toBe('40');
    });

    test('数値は文字列化してから判定される', () => {
      const TOKENS = {
        size: ['10', '20', '30'],
      };
      expect(getMaybeTokenValue('size', 10, TOKENS)).toBe('var(--size--10)');
      expect(getMaybeTokenValue('size', 20, TOKENS)).toBe('var(--size--20)');
    });
  });

  describe('値付きフラットマップ（{ key: value }）の tokenValues', () => {
    test('TOKEN_VAR_PREFIX 未登録トークンは既定形式 --{token}--{key}', () => {
      const TOKENS = {
        custom: { foo: '1px', bar: '2px' },
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(--custom--foo)');
      expect(getMaybeTokenValue('custom', 'bar', TOKENS)).toBe('var(--custom--bar)');
    });

    test('TOKEN_VAR_PREFIX 登録トークン（space）はフラット命名 --s{key}', () => {
      const TOKENS = {
        space: { '5': '-', '10': '-', '20': '-', '30': '-' },
      };
      expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--s20)');
      expect(getMaybeTokenValue('space', '100', TOKENS)).toBe('100');
    });

    test("'-' センチネル値のキーもカタログ上は有効（membership はキーの有無で判定）", () => {
      const TOKENS = {
        color: { brand: '-', accent: '-' },
      };
      expect(getMaybeTokenValue('color', 'brand', TOKENS)).toBe('var(--brand)');
    });

    test('キーに含まれない場合、値をそのまま返す', () => {
      const TOKENS = {
        custom: { foo: '1px' },
      };
      expect(getMaybeTokenValue('custom', 'baz', TOKENS)).toBe('baz');
    });

    test('空マップの場合、値をそのまま返す', () => {
      const TOKENS = {
        custom: {},
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('foo');
    });
  });

  describe('color トークンの解決（color → palette の順）', () => {
    test('color カタログに含まれる場合、--{key} を返す', () => {
      const TOKENS = {
        color: new Set(['brand', 'accent']),
      };
      expect(getMaybeTokenValue('color', 'brand', TOKENS)).toBe('var(--brand)');
      expect(getMaybeTokenValue('color', 'accent', TOKENS)).toBe('var(--accent)');
    });

    test('color に見つからない場合は palette から検索する', () => {
      const TOKENS = {
        color: new Set(['brand']),
        palette: new Set(['red', 'blue']),
      };
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--red)');
      expect(getMaybeTokenValue('color', 'blue', TOKENS)).toBe('var(--blue)');
    });

    test('color が優先される（color と palette の両方に存在しても色名は --{key} で同一）', () => {
      const TOKENS = {
        color: new Set(['red']),
        palette: new Set(['red', 'blue']),
      };
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--red)');
    });

    test('color にも palette にも見つからない場合、値をそのまま返す', () => {
      const TOKENS = {
        color: new Set(['brand']),
        palette: new Set(['red']),
      };
      expect(getMaybeTokenValue('color', 'green', TOKENS)).toBe('green');
    });

    test('color も palette も存在しない場合、値をそのまま返す', () => {
      const TOKENS = {};
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('red');
    });
  });

  describe('エッジケース', () => {
    test('特殊文字を含む値もそのまま変数名の一部になる', () => {
      const TOKENS = {
        custom: new Set(['foo-bar', 'baz_qux', '-webkit-fill-available']),
      };
      expect(getMaybeTokenValue('custom', 'foo-bar', TOKENS)).toBe('var(--custom--foo-bar)');
      expect(getMaybeTokenValue('custom', 'baz_qux', TOKENS)).toBe('var(--custom--baz_qux)');
      expect(getMaybeTokenValue('custom', '-webkit-fill-available', TOKENS)).toBe('var(--custom---webkit-fill-available)');
    });

    test('空の TOKENS オブジェクト', () => {
      const TOKENS = {};
      expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('10');
    });
  });
});
