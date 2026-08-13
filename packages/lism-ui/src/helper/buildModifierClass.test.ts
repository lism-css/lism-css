import { describe, it, expect } from 'vitest';
import buildModifierClass from './buildModifierClass';

describe('buildModifierClass', () => {
  it('baseClass のみの場合はそのまま返す', () => {
    expect(buildModifierClass('b--chat')).toBe('b--chat');
    expect(buildModifierClass('b--chat', {})).toBe('b--chat');
  });

  it('variant を渡すと BEM modifier を展開する', () => {
    expect(buildModifierClass('b--chat', { variant: 'speak' })).toBe('b--chat b--chat--speak');
  });

  it('複数の modifier を順に展開する', () => {
    expect(buildModifierClass('b--button', { variant: 'outline', size: 'lg' })).toBe('b--button b--button--outline b--button--lg');
  });

  it('undefined / null / false / 空文字 / 0 の値はスキップする', () => {
    expect(buildModifierClass('b--box', { variant: undefined })).toBe('b--box');
    expect(buildModifierClass('b--box', { variant: null })).toBe('b--box');
    expect(buildModifierClass('b--box', { variant: false })).toBe('b--box');
    expect(buildModifierClass('b--box', { variant: '' })).toBe('b--box');
    expect(buildModifierClass('b--grid', { cols: 0 })).toBe('b--grid');
  });

  it('一部だけ有効な modifier の場合、無効なものだけスキップする', () => {
    expect(buildModifierClass('b--button', { variant: 'outline', size: undefined, tone: 'primary' })).toBe(
      'b--button b--button--outline b--button--primary'
    );
  });

  it('数値の値も modifier として展開する', () => {
    expect(buildModifierClass('b--grid', { cols: 3 })).toBe('b--grid b--grid--3');
  });

  it('baseClass が空文字なら空文字を返す', () => {
    expect(buildModifierClass('')).toBe('');
    expect(buildModifierClass('', { variant: 'speak' })).toBe('');
  });
});
