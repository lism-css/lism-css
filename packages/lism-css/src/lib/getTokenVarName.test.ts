import { describe, test, expect } from 'vitest';
import getTokenVarName from './getTokenVarName';

describe('getTokenVarName', () => {
  describe('配列 / Set 形式（--{tokenKey}--{key}）', () => {
    test('配列形式のトークン', () => {
      const TOKENS = { lts: ['base', 's', 'l', 'xl'] };
      expect(getTokenVarName('lts', '2xl', TOKENS)).toBe('--lts--2xl');
    });

    test('Set 形式のトークン', () => {
      const TOKENS = { fz: new Set(['base', 'l']) };
      expect(getTokenVarName('fz', 'm', TOKENS)).toBe('--fz--m');
    });

    test('未登録トークンは配列形式を既定とする', () => {
      expect(getTokenVarName('newtoken', 'foo', {})).toBe('--newtoken--foo');
    });
  });

  describe('オブジェクト形式（{pre}{key}）', () => {
    test('space（pre: --s）', () => {
      const TOKENS = { space: { pre: '--s', values: ['10', '20'] } };
      expect(getTokenVarName('space', '90', TOKENS)).toBe('--s90');
    });

    test('c / palette（pre: --）', () => {
      const TOKENS = { c: { pre: '--', values: ['base', 'text'] } };
      expect(getTokenVarName('c', 'success', TOKENS)).toBe('--success');
    });

    test('pre 未指定（既定は空文字）', () => {
      const TOKENS = { custom: { values: ['foo'] } };
      expect(getTokenVarName('custom', 'bar', TOKENS)).toBe('bar');
    });
  });

  test('getMaybeTokenValue と同じ変数名を導出する（解決名と出力名の一致）', () => {
    // 配列形式・オブジェクト形式の双方で var() の中身が一致することを担保する。
    const TOKENS = {
      lts: ['base', '2xl'],
      space: { pre: '--s', values: ['90'] },
    };
    expect(`var(${getTokenVarName('lts', '2xl', TOKENS)})`).toBe('var(--lts--2xl)');
    expect(`var(${getTokenVarName('space', '90', TOKENS)})`).toBe('var(--s90)');
  });
});
