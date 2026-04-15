import { describe, test, expect } from 'vitest';
import getLayoutProps from './getLayoutProps';

describe('getLayoutProps', () => {
  describe('基本的な動作', () => {
    test('layout クラスが primitiveClass に追加される', () => {
      const result = getLayoutProps('flex', {});
      expect(result.primitiveClass).toContain('l--flex');
    });

    test('primitiveClass が未定義の場合でも layout クラスが追加される', () => {
      const result = getLayoutProps('stack', {});
      expect(result.primitiveClass).toEqual(['l--stack']);
    });
  });

  describe('grid レイアウト', () => {
    test('primitiveClass に l--grid が追加される', () => {
      const result = getLayoutProps('grid', {});
      expect(result.primitiveClass).toEqual(['l--grid']);
    });

    test('_propConfig は自動付与されない', () => {
      const result = getLayoutProps('grid', {});
      expect(result._propConfig).toBeUndefined();
    });
  });

  describe('sideMain レイアウト', () => {
    test('sideW が指定された場合、style に --sideW が設定される', () => {
      const result = getLayoutProps('sideMain', { sideW: '200px' });
      expect(result.style).toBeDefined();
      expect(result.style?.['--sideW']).toBe('200px');
    });

    test('mainW が指定された場合、style に --mainW が設定される', () => {
      const result = getLayoutProps('sideMain', { mainW: '800px' });
      expect(result.style).toBeDefined();
      expect(result.style?.['--mainW']).toBe('800px');
    });

    test('sideW と mainW の両方が指定された場合、両方とも設定される', () => {
      const result = getLayoutProps('sideMain', {
        sideW: '200px',
        mainW: '800px',
      });
      expect(result.style?.['--sideW']).toBe('200px');
      expect(result.style?.['--mainW']).toBe('800px');
    });

    test('sideW が null の場合、--sideW は設定されない', () => {
      const result = getLayoutProps('sideMain', { sideW: undefined });
      expect(result.style?.['--sideW']).toBeUndefined();
    });

    test('sideW が undefined の場合、--sideW は設定されない', () => {
      const result = getLayoutProps('sideMain', { sideW: undefined });
      expect(result.style?.['--sideW']).toBeUndefined();
    });

    test('既存の style がある場合、マージされる', () => {
      const result = getLayoutProps('sideMain', {
        sideW: '200px',
        style: { color: 'red' },
      });
      expect(result.style?.color).toBe('red');
      expect(result.style?.['--sideW']).toBe('200px');
    });

    test('sz トークンが適用される', () => {
      const result = getLayoutProps('sideMain', { sideW: 's' });
      expect(result.style?.['--sideW']).toBe('var(--sz--s)');
    });

    test('sideW と mainW 以外のpropsは維持される', () => {
      const result = getLayoutProps('sideMain', {
        sideW: '200px',
        mainW: '800px',
        otherProp: 'value',
      });
      expect(result.otherProp).toBe('value');
      expect((result as unknown as Record<string, unknown>).sideW).toBeUndefined();
      expect((result as unknown as Record<string, unknown>).mainW).toBeUndefined();
    });
  });

  describe('fluidCols レイアウト', () => {
    test('autoFill が true の場合、style に --autoMode が設定される', () => {
      const result = getLayoutProps('fluidCols', { autoFill: true });
      expect(result.style).toBeDefined();
      expect(result.style?.['--autoMode']).toBe('auto-fill');
    });

    test('autoFill が false の場合、--autoMode は設定されない', () => {
      const result = getLayoutProps('fluidCols', { autoFill: false });
      expect(result.style?.['--autoMode']).toBeUndefined();
    });

    test('autoFill が未定義の場合、--autoMode は設定されない', () => {
      const result = getLayoutProps('fluidCols', {});
      expect(result.style?.['--autoMode']).toBeUndefined();
    });

    test('既存の style がある場合、マージされる', () => {
      const result = getLayoutProps('fluidCols', {
        autoFill: true,
        style: { color: 'blue' },
      });
      expect(result.style?.color).toBe('blue');
      expect(result.style?.['--autoMode']).toBe('auto-fill');
    });

    test('autoFill 以外のpropsは維持される', () => {
      const result = getLayoutProps('fluidCols', {
        autoFill: true,
        otherProp: 'value',
      });
      expect(result.otherProp).toBe('value');
      expect((result as unknown as Record<string, unknown>).autoFill).toBeUndefined();
    });
  });

  describe('flow レイアウト', () => {
    test('flow がトークン値の場合、primitiveClass に -flow:{value} が追加される', () => {
      const result = getLayoutProps('flow', { flow: 's' });
      expect(result.primitiveClass).toContain('-flow:s');
      expect(result.primitiveClass).toContain('l--flow');
    });

    test('flow がトークン値でない場合、primitiveClass に -flow: が追加され、style に --flow が設定される', () => {
      const result = getLayoutProps('flow', { flow: '2rem' });
      expect(result.primitiveClass).toContain('-flow:');
      expect(result.primitiveClass).toContain('l--flow');
      expect(result.style?.['--flow']).toBe('2rem');
    });

    test('flow が数値トークンの場合、space トークンとして処理される', () => {
      const result = getLayoutProps('flow', { flow: 20 });
      expect(result.style?.['--flow']).toBe('var(--s20)');
    });

    test('flow が未定義の場合、何も追加されない', () => {
      const result = getLayoutProps('flow', {});
      expect(result.primitiveClass).toEqual(['l--flow']);
      expect(result.style).toBeUndefined();
    });

    test('flow が 0 の場合、何も変換されない', () => {
      const result = getLayoutProps('flow', { flow: 0 });
      expect(result.primitiveClass).toEqual(['l--flow']);
      expect(result.style).toBeUndefined();
    });

    test('既存の primitiveClass がある場合、マージされる', () => {
      const result = getLayoutProps('flow', {
        primitiveClass: ['existing'],
        flow: 's',
      });
      expect(result.primitiveClass).toContain('existing');
      expect(result.primitiveClass).toContain('l--flow');
      expect(result.primitiveClass).toContain('-flow:s');
    });

    test('既存の style がある場合、マージされる', () => {
      const result = getLayoutProps('flow', {
        flow: '1rem',
        style: { padding: '10px' },
      });
      expect(result.style?.padding).toBe('10px');
      expect(result.style?.['--flow']).toBe('1rem');
    });

    test('flow 以外のpropsは維持される', () => {
      const result = getLayoutProps('flow', {
        flow: 's',
        otherProp: 'value',
      });
      expect(result.otherProp).toBe('value');
      expect((result as unknown as Record<string, unknown>).flow).toBeUndefined();
    });
  });

  describe('switchCols レイアウト', () => {
    test('breakSize が指定された場合、style に --breakSize が設定される', () => {
      const result = getLayoutProps('switchCols', { breakSize: '600px' });
      expect(result.style).toBeDefined();
      expect(result.style?.['--breakSize']).toBe('600px');
    });

    test('breakSize が未定義の場合、--breakSize は設定されない', () => {
      const result = getLayoutProps('switchCols', {});
      expect(result.style?.['--breakSize']).toBeUndefined();
    });

    test('breakSize が 0 の場合、--breakSize は設定されない', () => {
      const result = getLayoutProps('switchCols', { breakSize: 0 });
      expect(result.style?.['--breakSize']).toBeUndefined();
    });

    test('breakSize が空文字の場合、--breakSize は設定されない', () => {
      const result = getLayoutProps('switchCols', { breakSize: '' });
      expect(result.style?.['--breakSize']).toBeUndefined();
    });

    test('sz トークンが適用される', () => {
      const result = getLayoutProps('switchCols', { breakSize: 'm' });
      expect(result.style?.['--breakSize']).toBe('var(--sz--m)');
    });

    test('既存の style がある場合、マージされる', () => {
      const result = getLayoutProps('switchCols', {
        breakSize: '600px',
        style: { margin: '20px' },
      });
      expect(result.style?.margin).toBe('20px');
      expect(result.style?.['--breakSize']).toBe('600px');
    });

    test('breakSize 以外のpropsは維持される', () => {
      const result = getLayoutProps('switchCols', {
        breakSize: '600px',
        otherProp: 'value',
      });
      expect(result.otherProp).toBe('value');
      expect((result as unknown as Record<string, unknown>).breakSize).toBeUndefined();
    });
  });

  describe('tileGrid レイアウト', () => {
    test('primitiveClass に l--tileGrid が追加される', () => {
      const result = getLayoutProps('tileGrid', {});
      expect(result.primitiveClass).toEqual(['l--tileGrid']);
    });

    test('既存の primitiveClass がある場合、マージされる', () => {
      const result = getLayoutProps('tileGrid', { primitiveClass: ['existing'] });
      expect(result.primitiveClass).toContain('l--tileGrid');
      expect(result.primitiveClass).toContain('existing');
    });

    test('その他のpropsはそのまま維持される', () => {
      const result = getLayoutProps('tileGrid', { style: { color: 'red' } } as Parameters<typeof getLayoutProps>[1]);
      expect(result.style?.color).toBe('red');
    });
  });

  describe('複数propsの組み合わせ', () => {
    test('primitiveClass と style が両方ある場合、正しく処理される', () => {
      const result = getLayoutProps('sideMain', {
        primitiveClass: ['custom-primitive'],
        sideW: '200px',
        style: { color: 'red' },
      });
      expect(result.primitiveClass).toContain('custom-primitive');
      expect(result.primitiveClass).toContain('l--sideMain');
      expect(result.style?.color).toBe('red');
      expect(result.style?.['--sideW']).toBe('200px');
    });

    test('レイアウト固有のpropsは削除され、その他は維持される', () => {
      const result = getLayoutProps('flow', {
        flow: 's',
        otherProp1: 'value1',
        otherProp2: 'value2',
      } as Parameters<typeof getLayoutProps>[1]);
      expect((result as unknown as Record<string, unknown>).flow).toBeUndefined();
      expect(result.primitiveClass).toContain('l--flow');
      expect((result as Record<string, unknown>).otherProp1).toBe('value1');
      expect((result as Record<string, unknown>).otherProp2).toBe('value2');
    });
  });
});
