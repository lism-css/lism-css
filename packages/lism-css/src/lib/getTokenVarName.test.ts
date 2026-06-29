import { describe, test, expect } from 'vitest';
import getTokenVarName from './getTokenVarName';

describe('getTokenVarName', () => {
  describe('既定（--{tokenKey}--{key}）', () => {
    test('配列形式のトークン（lts）', () => {
      expect(getTokenVarName('lts', '2xl')).toBe('--lts--2xl');
    });

    test('fz', () => {
      expect(getTokenVarName('fz', 'm')).toBe('--fz--m');
    });

    test('未登録トークンも既定形式', () => {
      expect(getTokenVarName('newtoken', 'foo')).toBe('--newtoken--foo');
    });
  });

  describe('TOKEN_VAR_PREFIX 登録トークン（{prefix}{key}）', () => {
    test('space（--s）', () => {
      expect(getTokenVarName('space', '90')).toBe('--s90');
    });

    test('color / palette（--）', () => {
      expect(getTokenVarName('color', 'brand')).toBe('--brand');
      expect(getTokenVarName('palette', 'red')).toBe('--red');
    });
  });

  test('getMaybeTokenValue と同じ変数名を導出する（解決名と出力名の一致）', () => {
    expect(`var(${getTokenVarName('lts', '2xl')})`).toBe('var(--lts--2xl)');
    expect(`var(${getTokenVarName('space', '90')})`).toBe('var(--s90)');
  });
});
