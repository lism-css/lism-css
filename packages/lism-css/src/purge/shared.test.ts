import { describe, test, expect } from 'vitest';
import { LISM_CSS_SIGNATURE } from './shared';

describe('LISM_CSS_SIGNATURE', () => {
  test('Lism の Property Class (.-x) にマッチする', () => {
    expect(LISM_CSS_SIGNATURE.test('.-p\\:20{padding:1rem}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.-bgc{background-color:red}')).toBe(true);
  });

  test('Lism の既知プレフィックス (l|c|a|is|has|set|u)-- にマッチする', () => {
    expect(LISM_CSS_SIGNATURE.test('.l--stack{display:flex}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.c--button{}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.a--icon{}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.is--container{}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.has--gutter{}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.set--plain{}')).toBe(true);
    expect(LISM_CSS_SIGNATURE.test('.u--cells{}')).toBe(true);
  });

  test('一般的な BEM クラス (.button--primary 等) にはマッチしない', () => {
    expect(LISM_CSS_SIGNATURE.test('.button--primary{color:red}')).toBe(false);
    expect(LISM_CSS_SIGNATURE.test('.card--featured{}')).toBe(false);
    expect(LISM_CSS_SIGNATURE.test('.nav--header{}')).toBe(false);
    expect(LISM_CSS_SIGNATURE.test('/*! Copyright 2024 */ .button--primary{color:red}')).toBe(false);
  });

  test('Lism クラスを含まない通常の CSS にはマッチしない', () => {
    expect(LISM_CSS_SIGNATURE.test('body{margin:0}')).toBe(false);
    expect(LISM_CSS_SIGNATURE.test('.foo{color:red}')).toBe(false);
    expect(LISM_CSS_SIGNATURE.test(':root{--x:1}')).toBe(false);
  });
});
