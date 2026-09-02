import { describe, it, expect } from 'vitest';
import getAvatarProps from './getProps';

describe('getAvatarProps', () => {
  it('name の先頭1文字をイニシャルにし、alt 未指定なら name を label にする', () => {
    expect(getAvatarProps({ name: 'Yamada Taro' })).toEqual({
      label: 'Yamada Taro',
      initial: 'Y',
      initialAtts: { role: 'img', 'aria-label': 'Yamada Taro' },
    });
  });

  it('サロゲートペア（絵文字）を壊さずに1文字取る', () => {
    expect(getAvatarProps({ name: '😀 Smile' }).initial).toBe('😀');
  });

  it('alt を明示すると name より優先される', () => {
    const result = getAvatarProps({ name: 'Yamada Taro', alt: '山田太郎のアバター' });
    expect(result.label).toBe('山田太郎のアバター');
    expect(result.initial).toBe('Y');
    expect(result.initialAtts).toEqual({ role: 'img', 'aria-label': '山田太郎のアバター' });
  });

  it('alt が空文字なら装飾扱い（aria-hidden）になる', () => {
    const result = getAvatarProps({ name: 'Yamada Taro', alt: '' });
    expect(result.label).toBe('');
    expect(result.initialAtts).toEqual({ 'aria-hidden': 'true' });
  });

  it('name も alt も無ければイニシャル無し・装飾扱いになる', () => {
    expect(getAvatarProps({})).toEqual({
      label: '',
      initial: '',
      initialAtts: { 'aria-hidden': 'true' },
    });
  });
});
