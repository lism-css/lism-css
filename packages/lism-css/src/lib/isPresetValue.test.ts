import { describe, test, expect } from 'vitest';
import isPresetValue from './isPresetValue';

// 判定の詳細はhelper/isMemberOf.test.tsで検証する。ここは委譲の接続確認のみ。
describe('isPresetValue', () => {
  test('Set の数値文字列に対して number は文字列化して判定される', () => {
    const presets = new Set(['1', '2', '3']);
    expect(isPresetValue(presets, 1)).toBe(true);
    expect(isPresetValue(presets, 4)).toBe(false);
  });
});
