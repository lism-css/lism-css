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
      expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('var(--space--10)');
      expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--space--20)');
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
      expect(getMaybeTokenValue('size', 10, TOKENS)).toBe('var(--size--10)');
      expect(getMaybeTokenValue('size', 20, TOKENS)).toBe('var(--size--20)');
    });

    test('セマンティック文字列のトークン値（実在する o トークン）', () => {
      const TOKENS = {
        o: new Set(['mp', 'p', 'pp', 'ppp']),
      };
      expect(getMaybeTokenValue('o', 'mp', TOKENS)).toBe('var(--o--mp)');
      expect(getMaybeTokenValue('o', 'pp', TOKENS)).toBe('var(--o--pp)');
    });
  });

  describe('Array 形式の tokenValues', () => {
    test('値が配列に含まれる場合、CSS変数を返す', () => {
      const TOKENS = {
        space: ['10', '20', '30'],
      };
      expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('var(--space--10)');
      expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--space--20)');
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

    test('セマンティック文字列のトークン値（実在する o トークン）', () => {
      const TOKENS = {
        o: ['mp', 'p', 'pp', 'ppp'],
      };
      expect(getMaybeTokenValue('o', 'mp', TOKENS)).toBe('var(--o--mp)');
      expect(getMaybeTokenValue('o', 'pp', TOKENS)).toBe('var(--o--pp)');
    });
  });

  describe('Object 形式の tokenValues', () => {
    test('pre と values を持つオブジェクト形式（Set）', () => {
      const TOKENS = {
        custom: {
          pre: '--my-',
          values: new Set(['foo', 'bar']),
        },
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(--my-foo)');
      expect(getMaybeTokenValue('custom', 'bar', TOKENS)).toBe('var(--my-bar)');
    });

    test('pre と values を持つオブジェクト形式（Array）', () => {
      const TOKENS = {
        custom: {
          pre: '--my-',
          values: ['foo', 'bar'],
        },
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(--my-foo)');
      expect(getMaybeTokenValue('custom', 'bar', TOKENS)).toBe('var(--my-bar)');
    });

    test('values に含まれない場合、値をそのまま返す', () => {
      const TOKENS = {
        custom: {
          pre: '--my-',
          values: new Set(['foo']),
        },
      };
      expect(getMaybeTokenValue('custom', 'baz', TOKENS)).toBe('baz');
    });

    test('pre が空文字列の場合', () => {
      const TOKENS = {
        custom: {
          pre: '',
          values: new Set(['foo']),
        },
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(foo)');
    });

    test('pre が undefined の場合（デフォルト値を使用）', () => {
      const TOKENS = {
        custom: {
          values: new Set(['foo']),
        },
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(foo)');
    });

    test('values が undefined の場合（デフォルト値を使用）', () => {
      const TOKENS = {
        custom: {
          pre: '--my-',
        },
      };
      expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('foo');
    });
  });

  describe('color トークンの特殊処理', () => {
    test('color は c トークンから検索を試みる', () => {
      const TOKENS = {
        c: new Set(['red', 'blue']),
      };
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--c--red)');
      expect(getMaybeTokenValue('color', 'blue', TOKENS)).toBe('var(--c--blue)');
    });

    test('c に見つからない場合は palette から検索を試みる', () => {
      const TOKENS = {
        c: new Set(['red']),
        palette: new Set(['primary', 'secondary']),
      };
      expect(getMaybeTokenValue('color', 'primary', TOKENS)).toBe('var(--palette--primary)');
      expect(getMaybeTokenValue('color', 'secondary', TOKENS)).toBe('var(--palette--secondary)');
    });

    test('c が優先される', () => {
      const TOKENS = {
        c: new Set(['red']),
        palette: new Set(['red', 'blue']),
      };
      // 'red' は c にも palette にも存在するが、c が優先される
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--c--red)');
    });

    test('c にも palette にも見つからない場合、値をそのまま返す', () => {
      const TOKENS = {
        c: new Set(['red']),
        palette: new Set(['primary']),
      };
      expect(getMaybeTokenValue('color', 'green', TOKENS)).toBe('green');
    });

    test('c も palette も存在しない場合、値をそのまま返す', () => {
      const TOKENS = {};
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('red');
    });
  });

  describe('Set と Array で同じ結果を返す', () => {
    test('同じ値のリストで同じ結果になる', () => {
      const values = ['10', '20', '30'];
      const TOKENS_SET = { space: new Set(values) };
      const TOKENS_ARRAY = { space: values };

      expect(getMaybeTokenValue('space', '10', TOKENS_SET)).toBe(getMaybeTokenValue('space', '10', TOKENS_ARRAY));
      expect(getMaybeTokenValue('space', '20', TOKENS_SET)).toBe(getMaybeTokenValue('space', '20', TOKENS_ARRAY));
      expect(getMaybeTokenValue('space', '40', TOKENS_SET)).toBe(getMaybeTokenValue('space', '40', TOKENS_ARRAY));
    });
  });

  describe('エッジケース', () => {
    test('空文字列の値', () => {
      const TOKENS = {
        space: new Set(['']),
      };
      expect(getMaybeTokenValue('space', '', TOKENS)).toBe('var(--space--)');
    });

    test('0 の値', () => {
      const TOKENS = {
        space: new Set(['0']),
      };
      expect(getMaybeTokenValue('space', 0, TOKENS)).toBe('var(--space--0)');
      expect(getMaybeTokenValue('space', '0', TOKENS)).toBe('var(--space--0)');
    });

    test('浮動小数点数', () => {
      const TOKENS = {
        size: new Set(['1.5', '2.5']),
      };
      expect(getMaybeTokenValue('size', 1.5, TOKENS)).toBe('var(--size--1.5)');
      expect(getMaybeTokenValue('size', 2.5, TOKENS)).toBe('var(--size--2.5)');
    });

    test('特殊文字を含む値', () => {
      const TOKENS = {
        custom: new Set(['foo-bar', 'baz_qux']),
      };
      expect(getMaybeTokenValue('custom', 'foo-bar', TOKENS)).toBe('var(--custom--foo-bar)');
      expect(getMaybeTokenValue('custom', 'baz_qux', TOKENS)).toBe('var(--custom--baz_qux)');
    });

    test('マイナスで始まる値もそのまま変数名の一部になる', () => {
      const TOKENS = {
        custom: new Set(['-webkit-fill-available']),
      };
      expect(getMaybeTokenValue('custom', '-webkit-fill-available', TOKENS)).toBe('var(--custom---webkit-fill-available)');
    });

    test('空の TOKENS オブジェクト', () => {
      const TOKENS = {};
      expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('10');
    });

    test('大量のトークン値', () => {
      const values = new Set(Array.from({ length: 100 }, (_, i) => `${i}`));
      const TOKENS = { size: values };
      expect(getMaybeTokenValue('size', '50', TOKENS)).toBe('var(--size--50)');
      expect(getMaybeTokenValue('size', '99', TOKENS)).toBe('var(--size--99)');
    });
  });

  describe('実際の使用例', () => {
    test('space トークン（pre=--s のカスタムプレフィックス形式）', () => {
      const TOKENS = {
        space: {
          pre: '--s',
          values: new Set(['5', '10', '15', '20', '30', '40', '50', '60', '70', '80']),
        },
      };
      expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--s20)');
      expect(getMaybeTokenValue('space', '100', TOKENS)).toBe('100');
    });

    test('カラートークン（color は c → palette の順に解決される）', () => {
      const TOKENS = {
        c: {
          pre: '--',
          values: new Set(['base', 'text', 'brand', 'accent']),
        },
        palette: {
          pre: '--',
          values: new Set(['red', 'blue', 'green', 'keycolor']),
        },
      };
      expect(getMaybeTokenValue('color', 'base', TOKENS)).toBe('var(--base)');
      expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--red)');
      expect(getMaybeTokenValue('color', 'custom', TOKENS)).toBe('custom');
    });

    test('opacity トークン（音楽記号を用いた実在の o トークン）', () => {
      const TOKENS = {
        o: new Set(['mp', 'p', 'pp', 'ppp']),
      };
      expect(getMaybeTokenValue('o', 'mp', TOKENS)).toBe('var(--o--mp)');
      expect(getMaybeTokenValue('o', 'p', TOKENS)).toBe('var(--o--p)');
      expect(getMaybeTokenValue('o', 'pp', TOKENS)).toBe('var(--o--pp)');
      expect(getMaybeTokenValue('o', 'ppp', TOKENS)).toBe('var(--o--ppp)');
    });
  });
});
