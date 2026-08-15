import { describe, it, expect } from 'vitest';
import { resolveTabNavKey, toTabOrientation } from './tabsKeyNav';

describe('toTabOrientation', () => {
  it('vertical だけを vertical として扱う', () => {
    expect(toTabOrientation('vertical')).toBe('vertical');
  });

  it('未指定・不正値は既定の horizontal になる', () => {
    expect(toTabOrientation('horizontal')).toBe('horizontal');
    expect(toTabOrientation(null)).toBe('horizontal');
    expect(toTabOrientation(undefined)).toBe('horizontal');
    expect(toTabOrientation('')).toBe('horizontal');
    expect(toTabOrientation('VERTICAL')).toBe('horizontal');
  });
});

describe('resolveTabNavKey / 水平（既定）', () => {
  it('ArrowRight は次、ArrowLeft は前のインデックスを返す', () => {
    expect(resolveTabNavKey('ArrowRight', 1, 3)).toBe(2);
    expect(resolveTabNavKey('ArrowLeft', 3, 3)).toBe(2);
  });

  it('末尾で次へ進むと先頭、先頭で前へ戻ると末尾にラップする', () => {
    expect(resolveTabNavKey('ArrowRight', 3, 3)).toBe(1);
    expect(resolveTabNavKey('ArrowLeft', 1, 3)).toBe(3);
  });

  // APG: 水平タブリストは上下キーを拾わず、ブラウザ本来のスクロールに残す
  it('ArrowDown / ArrowUp は null を返す', () => {
    expect(resolveTabNavKey('ArrowDown', 1, 3)).toBeNull();
    expect(resolveTabNavKey('ArrowUp', 2, 3)).toBeNull();
  });
});

describe('resolveTabNavKey / 垂直', () => {
  it('ArrowDown は次、ArrowUp は前のインデックスを返す', () => {
    expect(resolveTabNavKey('ArrowDown', 1, 3, 'vertical')).toBe(2);
    expect(resolveTabNavKey('ArrowUp', 3, 3, 'vertical')).toBe(2);
  });

  it('末尾で次へ進むと先頭、先頭で前へ戻ると末尾にラップする', () => {
    expect(resolveTabNavKey('ArrowDown', 3, 3, 'vertical')).toBe(1);
    expect(resolveTabNavKey('ArrowUp', 1, 3, 'vertical')).toBe(3);
  });

  it('ArrowRight / ArrowLeft は null を返す', () => {
    expect(resolveTabNavKey('ArrowRight', 1, 3, 'vertical')).toBeNull();
    expect(resolveTabNavKey('ArrowLeft', 2, 3, 'vertical')).toBeNull();
  });
});

describe('resolveTabNavKey / 向きに依存しない挙動', () => {
  it('Home は先頭、End は末尾を返す', () => {
    expect(resolveTabNavKey('Home', 3, 3)).toBe(1);
    expect(resolveTabNavKey('End', 1, 3)).toBe(3);
    expect(resolveTabNavKey('Home', 3, 3, 'vertical')).toBe(1);
    expect(resolveTabNavKey('End', 1, 3, 'vertical')).toBe(3);
  });

  it('タブが1つだけなら常に同じインデックスを返す', () => {
    expect(resolveTabNavKey('ArrowRight', 1, 1)).toBe(1);
    expect(resolveTabNavKey('ArrowLeft', 1, 1)).toBe(1);
    expect(resolveTabNavKey('End', 1, 1)).toBe(1);
  });

  it('対象外のキーは null を返す', () => {
    expect(resolveTabNavKey('Enter', 1, 3)).toBeNull();
    expect(resolveTabNavKey(' ', 1, 3)).toBeNull();
    expect(resolveTabNavKey('Tab', 1, 3)).toBeNull();
    expect(resolveTabNavKey('a', 1, 3)).toBeNull();
  });

  it('タブが無い場合は null を返す', () => {
    expect(resolveTabNavKey('ArrowRight', 1, 0)).toBeNull();
    expect(resolveTabNavKey('Home', 1, 0)).toBeNull();
    expect(resolveTabNavKey('ArrowDown', 1, 0, 'vertical')).toBeNull();
  });
});
