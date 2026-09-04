import { describe, expect, it } from 'vitest';
import { findUncoveredChars } from './ogFontCoverage';

// テスト用の収録文字セット（実ファイルには依存させない）
const covered = new Set([...'Lism CSSのドキュメント。𠮷']);

describe('findUncoveredChars', () => {
  it('収録済みの文字だけなら空配列を返す', () => {
    expect(findUncoveredChars('Lism CSSのドキュメント', covered)).toEqual([]);
  });

  it('未収録の文字だけが返る', () => {
    expect(findUncoveredChars('Lismの解説', covered)).toEqual(['解', '説']);
  });

  it('空白（スペース・改行・タブ）は未収録でも無視される', () => {
    expect(findUncoveredChars('Lism\n\tCSS 　', covered)).toEqual([]);
  });

  it('同じ未収録文字が複数回出ても結果は1つにまとまる', () => {
    expect(findUncoveredChars('解解説解', covered)).toEqual(['解', '説']);
  });

  it('サロゲートペアの文字を1文字として扱う', () => {
    expect(findUncoveredChars('𠮷野家', covered)).toEqual(['野', '家']);
  });
});
