import { describe, it, expect } from 'vitest';
import { charBoundary, diffCode, diffTokenEdits, type CodeDiff } from './diff';

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

  it('数字の連なりを末尾側で分断しない（-fw:700 → -fw:800 は数値まるごと書き換え）', () => {
    const d = diffCode('-fw:700', '-fw:800');
    expect(d.head).toBe('-fw:');
    expect(d.removed).toBe('700');
    expect(d.inserted).toBe('800');
    expect(d.tail).toBe('');
  });

  it('数字の連なりを先頭側で分断しない（-p:10 → -p:15）', () => {
    const d = diffCode('-p:10', '-p:15');
    expect(d.head).toBe('-p:');
    expect(d.removed).toBe('10');
    expect(d.inserted).toBe('15');
  });

  it('数字に隣接するだけの編集は数字を巻き込まない', () => {
    const d = diffCode('-p:10 x', '-p:10y x');
    expect(d.head).toBe('-p:10');
    expect(d.removed).toBe('');
    expect(d.inserted).toBe('y');
  });
});

describe('diffTokenEdits', () => {
  /** 編集列を順に適用し、各編集の整合（head + removed + tail = 適用前の全文）も検証する */
  const applyEdits = (from: string, edits: CodeDiff[]): string =>
    edits.reduce((current, edit) => {
      expect(edit.head + edit.removed + edit.tail).toBe(current);
      return edit.head + edit.inserted + edit.tail;
    }, from);

  it('変更トークンのまとまりごとに1編集へ分かれる（間の無変更トークンは巻き込まない）', () => {
    const from = '<div class="l--flex -jc:center -ai:center -g:15">';
    const to = '<div class="l--stack -ai:center -g:20">';
    const edits = diffTokenEdits(from, to);
    // flex → stack、-jc:center の削除、-g の値変更、の3編集（-ai:center は再タイプしない）
    expect(edits.map(({ removed, inserted }) => [removed, inserted])).toEqual([
      ['flex', 'stack'],
      [' -jc:center', ''],
      ['15', '20'],
    ]);
    expect(applyEdits(from, edits)).toBe(to);
  });

  it('巻き戻し方向（ループの継ぎ目）も同じ分かれ方になる', () => {
    const from = '<div class="l--stack -ai:center -g:20">';
    const to = '<div class="l--flex -jc:center -ai:center -g:15">';
    const edits = diffTokenEdits(from, to);
    // stack → flex、-jc:center の挿入、-g の値変更、の3編集（往路と対称）
    expect(edits.map(({ removed, inserted }) => [removed, inserted])).toEqual([
      ['stack', 'flex'],
      ['', '-jc:center '],
      ['20', '15'],
    ]);
    expect(applyEdits(from, edits)).toBe(to);
  });

  it('複数行ブロック（JSX表記）でも同様に分かれ、無変更の子要素行は巻き込まない', () => {
    const from = '<Flex jc="center" ai="center" g="15">\n  <a href="/docs/">x</a>\n</Flex>';
    const to = '<Stack ai="center" g="20">\n  <a href="/docs/">x</a>\n</Stack>';
    const edits = diffTokenEdits(from, to);
    expect(edits.map(({ removed, inserted }) => [removed, inserted])).toEqual([
      ['Flex', 'Stack'],
      [' jc="center"', ''],
      ['15', '20'],
      ['Flex', 'Stack'],
    ]);
    expect(applyEdits(from, edits)).toBe(to);

    // 巻き戻し方向も対称に分かれる
    const reverse = diffTokenEdits(to, from);
    expect(reverse.map(({ removed, inserted }) => [removed, inserted])).toEqual([
      ['Stack', 'Flex'],
      ['', 'jc="center" '],
      ['20', '15'],
      ['Stack', 'Flex'],
    ]);
    expect(applyEdits(to, reverse)).toBe(from);
  });

  it('数字だけが変わるトークンは数値まるごと1編集で書き換える', () => {
    const from = '<h1 class="u--trim -fw:700 -ta:center">';
    const to = '<h1 class="u--trim -fw:800 -ta:center">';
    const edits = diffTokenEdits(from, to);
    expect(edits.map(({ removed, inserted }) => [removed, inserted])).toEqual([['700', '800']]);
    expect(applyEdits(from, edits)).toBe(to);
  });

  it('変更がなければ空の編集列', () => {
    expect(diffTokenEdits('a b c', 'a b c')).toEqual([]);
  });

  it('全トークンが変わる場合も1編集として成立する', () => {
    const edits = diffTokenEdits('abc', 'xyz');
    expect(edits).toHaveLength(1);
    expect(applyEdits('abc', edits)).toBe('xyz');
  });
});
