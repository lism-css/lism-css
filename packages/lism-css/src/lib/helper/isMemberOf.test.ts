import { describe, test, expect } from 'vitest';
import isMemberOf from './isMemberOf';

describe('isMemberOf', () => {
  test('Set に含まれるかを判定する', () => {
    expect(isMemberOf(new Set(['10', '20']), '10')).toBe(true);
    expect(isMemberOf(new Set(['10', '20']), '30')).toBe(false);
  });

  test('配列に含まれるかを判定する', () => {
    expect(isMemberOf(['s', 'm'], 'm')).toBe(true);
    expect(isMemberOf(['s', 'm'], 'l')).toBe(false);
  });

  test('オブジェクトは自身のキーで判定する', () => {
    expect(isMemberOf({ brand: '#000' }, 'brand')).toBe(true);
    expect(isMemberOf({ brand: '#000' }, 'toString')).toBe(false);
  });

  test('number は文字列化して判定する', () => {
    expect(isMemberOf(new Set(['10']), 10)).toBe(true);
  });

  test('string / number 以外の value は false', () => {
    expect(isMemberOf(new Set(['true']), true)).toBe(false);
    expect(isMemberOf(['null'], null)).toBe(false);
  });

  test('collection が無い場合は false', () => {
    expect(isMemberOf(undefined, '10')).toBe(false);
    expect(isMemberOf(null, '10')).toBe(false);
  });
});
