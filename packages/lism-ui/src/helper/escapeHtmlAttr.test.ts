import { describe, it, expect } from 'vitest';
import escapeHtmlAttr from './escapeHtmlAttr';

describe('escapeHtmlAttr', () => {
  it('属性値を壊す特殊文字をエスケープする', () => {
    expect(escapeHtmlAttr('a"b\'c<d>e&f')).toBe('a&quot;b&#39;c&lt;d&gt;e&amp;f');
  });

  it('通常のIDはそのまま返す', () => {
    expect(escapeHtmlAttr('my-tab_1')).toBe('my-tab_1');
  });
});
