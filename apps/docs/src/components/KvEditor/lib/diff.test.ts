import { describe, it, expect } from 'vitest';
import { charBoundary, diffCode } from './diff';

// サロゲートペア（UTF-16 で 2 単位）の素材。😀 = HIGH + LOW_A、😁 = HIGH + LOW_B
const HIGH = '\ud83d';
const LOW_A = '\ude00';
const LOW_B = '\ude01';

describe('charBoundary', () => {
  it('サロゲートペアを割る位置なら手前へ戻す', () => {
    expect(charBoundary(`a${HIGH}${LOW_A}b`, 2)).toBe(1);
  });

  it('ペアを割らない位置はそのまま', () => {
    expect(charBoundary(`a${HIGH}${LOW_A}b`, 1)).toBe(1);
    expect(charBoundary(`a${HIGH}${LOW_A}b`, 3)).toBe(3);
    expect(charBoundary('abc', 2)).toBe(2);
    expect(charBoundary('abc', 0)).toBe(0);
  });
});

describe('diffCode', () => {
  it('共通の先頭・末尾を除いた差分を返す', () => {
    const d = diffCode('<div class="a">x</div>', '<div class="b">x</div>');
    expect(d.removed).toBe('a');
    expect(d.inserted).toBe('b');
    expect(d.head + d.removed + d.tail).toBe('<div class="a">x</div>');
    expect(d.head + d.inserted + d.tail).toBe('<div class="b">x</div>');
  });

  it('絵文字を差し替えても先頭側でサロゲートペアを割らない', () => {
    const from = `a${HIGH}${LOW_A}b`;
    const to = `a${HIGH}${LOW_B}b`;
    const d = diffCode(from, to);
    expect(d.head).toBe('a'); // 上位サロゲートだけを head に残さない
    expect(d.removed).toBe(`${HIGH}${LOW_A}`);
    expect(d.inserted).toBe(`${HIGH}${LOW_B}`);
    expect(d.head + d.removed + d.tail).toBe(from);
    expect(d.head + d.inserted + d.tail).toBe(to);
  });

  it('末尾側の切れ目が下位サロゲートから始まらない', () => {
    const from = `X${HIGH}${LOW_A}`;
    const to = `Y\ud83c${LOW_A}`;
    const d = diffCode(from, to);
    expect(d.tail).toBe('');
    expect(d.head + d.removed + d.tail).toBe(from);
    expect(d.head + d.inserted + d.tail).toBe(to);
  });
});
