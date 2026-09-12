import type { CodeRange } from './diff';

export interface CodeHighlightSegment {
  line: number;
  lineStart: number;
  start: number;
  end: number;
  marker: boolean;
}

const clamp = (value: number, max: number): number => Math.max(0, Math.min(max, value));

/** UTF-16範囲を、改行をまたがない表示用の区間へ分割する。 */
export const splitCodeRanges = (code: string, ranges: readonly CodeRange[]): CodeHighlightSegment[] => {
  const lineStarts = [0];
  for (let index = code.indexOf('\n'); index !== -1; index = code.indexOf('\n', index + 1)) {
    lineStarts.push(index + 1);
  }

  const lineAt = (offset: number): number => {
    let low = 0;
    let high = lineStarts.length;
    while (low + 1 < high) {
      const middle = Math.floor((low + high) / 2);
      if (lineStarts[middle] <= offset) low = middle;
      else high = middle;
    }
    return low;
  };

  return ranges.flatMap((range) => {
    const first = clamp(Math.min(range.start, range.end), code.length);
    const last = clamp(Math.max(range.start, range.end), code.length);
    if (first === last) {
      const line = lineAt(first);
      return [{ line, lineStart: lineStarts[line], start: first, end: first, marker: true }];
    }

    const firstLine = lineAt(first);
    const lastLine = lineAt(last - 1);
    const segments: CodeHighlightSegment[] = [];
    for (let line = firstLine; line <= lastLine; line++) {
      const lineStart = lineStarts[line];
      const lineEnd = line + 1 < lineStarts.length ? lineStarts[line + 1] - 1 : code.length;
      const start = Math.max(first, lineStart);
      const end = Math.min(last, lineEnd);
      const includesLineBreak = lineEnd < code.length && first <= lineEnd && last > lineEnd;
      if (end > start || includesLineBreak) {
        segments.push({ line, lineStart, start, end, marker: end === start });
      }
    }
    return segments;
  });
};

/** CSSの数値tab-sizeと同じく、空白幅の倍数にある次のタブ位置まで進める。 */
export const measureTextWithTabs = (text: string, measure: (plainText: string) => number, tabSize = 2): number => {
  if (!text.includes('\t')) return measure(text);
  const tabWidth = measure(' '.repeat(tabSize));
  if (tabWidth <= 0) return measure(text.replaceAll('\t', ' '.repeat(tabSize)));

  let width = 0;
  let chunkStart = 0;
  for (let index = text.indexOf('\t'); index !== -1; index = text.indexOf('\t', index + 1)) {
    width += measure(text.slice(chunkStart, index));
    const remainder = width % tabWidth;
    width += remainder < 0.001 ? tabWidth : tabWidth - remainder;
    chunkStart = index + 1;
  }
  return width + measure(text.slice(chunkStart));
};
