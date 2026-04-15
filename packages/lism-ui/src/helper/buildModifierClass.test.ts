import { describe, it, expect } from 'vitest';
import buildModifierClass from './buildModifierClass';

describe('buildModifierClass', () => {
  it('baseClass のみの場合はそのまま返す', () => {
    expect(buildModifierClass('c--chat')).toBe('c--chat');
    expect(buildModifierClass('c--chat', {})).toBe('c--chat');
  });

  it('variant を渡すと BEM modifier を展開する', () => {
    expect(buildModifierClass('c--chat', { variant: 'speak' })).toBe('c--chat c--chat--speak');
  });

  it('複数の modifier を順に展開する', () => {
    expect(buildModifierClass('c--button', { variant: 'outline', size: 'lg' })).toBe('c--button c--button--outline c--button--lg');
  });

  it('undefined / null / false / 空文字の値はスキップする', () => {
    expect(buildModifierClass('c--box', { variant: undefined })).toBe('c--box');
    expect(buildModifierClass('c--box', { variant: null })).toBe('c--box');
    expect(buildModifierClass('c--box', { variant: false })).toBe('c--box');
    expect(buildModifierClass('c--box', { variant: '' })).toBe('c--box');
  });

  it('一部だけ有効な modifier の場合、無効なものだけスキップする', () => {
    expect(buildModifierClass('c--button', { variant: 'outline', size: undefined, tone: 'primary' })).toBe(
      'c--button c--button--outline c--button--primary'
    );
  });

  it('数値の値も modifier として展開する', () => {
    expect(buildModifierClass('c--grid', { cols: 3 })).toBe('c--grid c--grid--3');
  });

  it('baseClass が空文字なら空文字を返す', () => {
    expect(buildModifierClass('')).toBe('');
    expect(buildModifierClass('', { variant: 'speak' })).toBe('');
  });
});
