import { describe, expect, it } from 'vitest';
import { measureTextWithTabs, splitCodeRanges } from './code-highlights';

describe('splitCodeRanges', () => {
  it('同じ行の範囲をそのまま返す', () => {
    expect(splitCodeRanges('abc\ndef', [{ start: 1, end: 3 }])).toEqual([{ line: 0, lineStart: 0, start: 1, end: 3, marker: false }]);
  });

  it('複数行の範囲を行ごとに分ける', () => {
    expect(splitCodeRanges('abc\ndef\nghi', [{ start: 2, end: 9 }])).toEqual([
      { line: 0, lineStart: 0, start: 2, end: 3, marker: false },
      { line: 1, lineStart: 4, start: 4, end: 7, marker: false },
      { line: 2, lineStart: 8, start: 8, end: 9, marker: false },
    ]);
  });

  it('ゼロ長範囲と改行だけの範囲を位置マーカーにする', () => {
    expect(
      splitCodeRanges('a\nb', [
        { start: 2, end: 2 },
        { start: 1, end: 2 },
      ])
    ).toEqual([
      { line: 1, lineStart: 2, start: 2, end: 2, marker: true },
      { line: 0, lineStart: 0, start: 1, end: 1, marker: true },
    ]);
  });

  it('離れた範囲を独立した区間として返す', () => {
    expect(
      splitCodeRanges('abc\ndef', [
        { start: 0, end: 1 },
        { start: 5, end: 7 },
      ])
    ).toEqual([
      { line: 0, lineStart: 0, start: 0, end: 1, marker: false },
      { line: 1, lineStart: 4, start: 5, end: 7, marker: false },
    ]);
  });
});

describe('measureTextWithTabs', () => {
  const measure = (text: string): number => text.length * 10;

  it('タブを次の停止位置までの幅として測る', () => {
    expect(measureTextWithTabs('a\tb', measure)).toBe(30);
    expect(measureTextWithTabs('ab\tb', measure)).toBe(50);
    expect(measureTextWithTabs('\t\t', measure)).toBe(40);
  });

  it('タブがなければ通常の計測結果を返す', () => {
    expect(measureTextWithTabs('abc', measure)).toBe(30);
  });
});
