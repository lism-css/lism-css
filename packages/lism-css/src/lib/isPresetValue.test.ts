import { describe, test, expect } from 'vitest';
import isPresetValue from './isPresetValue';

describe('isPresetValue', () => {
  describe('Set を使用した場合', () => {
    test('Set に含まれる値は true を返す', () => {
      const presets = new Set(['foo', 'bar', 'baz']);
      expect(isPresetValue(presets, 'foo')).toBe(true);
      expect(isPresetValue(presets, 'bar')).toBe(true);
      expect(isPresetValue(presets, 'baz')).toBe(true);
    });

    test('Set に含まれない値は false を返す', () => {
      const presets = new Set(['foo', 'bar']);
      expect(isPresetValue(presets, 'baz')).toBe(false);
      expect(isPresetValue(presets, 'qux')).toBe(false);
    });

    test('空の Set は常に false を返す', () => {
      const presets = new Set<string>();
      expect(isPresetValue(presets, 'foo')).toBe(false);
    });

    test('数値は文字列化して判定される', () => {
      const presets = new Set(['1', '2', '3']);
      expect(isPresetValue(presets, 1)).toBe(true);
      expect(isPresetValue(presets, 2)).toBe(true);
      expect(isPresetValue(presets, 4)).toBe(false);
    });

    test('数値の 0 も正しく判定される', () => {
      const presets = new Set(['0']);
      expect(isPresetValue(presets, 0)).toBe(true);
    });
  });

  describe('Array を使用した場合', () => {
    test('配列に含まれる値は true を返す', () => {
      const presets = ['foo', 'bar', 'baz'];
      expect(isPresetValue(presets, 'foo')).toBe(true);
      expect(isPresetValue(presets, 'bar')).toBe(true);
      expect(isPresetValue(presets, 'baz')).toBe(true);
    });

    test('配列に含まれない値は false を返す', () => {
      const presets = ['foo', 'bar'];
      expect(isPresetValue(presets, 'baz')).toBe(false);
      expect(isPresetValue(presets, 'qux')).toBe(false);
    });

    test('空配列は常に false を返す', () => {
      const presets: string[] = [];
      expect(isPresetValue(presets, 'foo')).toBe(false);
    });

    test('数値は文字列化して判定される', () => {
      const presets = ['1', '2', '3'];
      expect(isPresetValue(presets, 1)).toBe(true);
      expect(isPresetValue(presets, 2)).toBe(true);
      expect(isPresetValue(presets, 4)).toBe(false);
    });

    test('数値の 0 も正しく判定される', () => {
      const presets = ['0'];
      expect(isPresetValue(presets, 0)).toBe(true);
    });
  });

  describe('エッジケース', () => {
    test('空文字列の判定', () => {
      const presets = new Set(['', 'foo']);
      expect(isPresetValue(presets, '')).toBe(true);
    });
  });
});
