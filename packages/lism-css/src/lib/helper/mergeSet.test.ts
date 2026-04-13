import { describe, test, expect } from 'vitest';
import mergeSet from './mergeSet';

describe('mergeSet', () => {
  describe('値の正規化', () => {
    test('単一の文字列', () => {
      expect(mergeSet(undefined, 'gutter')).toEqual(['gutter']);
    });

    test('空白区切りの文字列を分割', () => {
      expect(mergeSet(undefined, 'plain hov')).toEqual(['plain', 'hov']);
    });

    test('複数の空白を分割してトリム', () => {
      expect(mergeSet(undefined, '  hov   transition  shadow ')).toEqual(['hov', 'transition', 'shadow']);
    });

    test('空文字列は空配列', () => {
      expect(mergeSet(undefined, '')).toEqual([]);
    });

    test('空白のみの要素はフィルタされる', () => {
      expect(mergeSet(undefined, 'hov   shadow')).toEqual(['hov', 'shadow']);
    });

    test('重複は除去される', () => {
      expect(mergeSet(undefined, 'hov hov shadow')).toEqual(['hov', 'shadow']);
    });

    test('base と value は重複除去して結合される', () => {
      expect(mergeSet('plain hov', 'hov gutter')).toEqual(['plain', 'hov', 'gutter']);
    });

    test('カンマ区切りの文字列も互換として受け付ける', () => {
      expect(mergeSet(undefined, 'hov,transition')).toEqual(['hov', 'transition']);
    });

    test('カンマ + スペース混在でも分割される', () => {
      expect(mergeSet(undefined, 'hov, transition, shadow')).toEqual(['hov', 'transition', 'shadow']);
    });
  });

  describe('`-` prefix による除外', () => {
    test('value 内の `-name` で base の値を除外できる', () => {
      expect(mergeSet('plain hov', '-hov')).toEqual(['plain']);
    });

    test('value 内の `-name` を含めつつ追加もできる', () => {
      expect(mergeSet('plain hov', 'gutter -hov')).toEqual(['plain', 'gutter']);
    });

    test('value 単体内で除外指定できる', () => {
      expect(mergeSet(undefined, 'hov transition shadow -shadow')).toEqual(['hov', 'transition']);
    });

    test('複数の除外指定', () => {
      expect(mergeSet(undefined, 'hov transition shadow -hov -shadow')).toEqual(['transition']);
    });

    test('base 側の `-name` でも除外として扱われる', () => {
      expect(mergeSet('-hov', 'hov transition')).toEqual(['transition']);
    });

    test('全て除外されると空配列', () => {
      expect(mergeSet('gutter', '-gutter')).toEqual([]);
    });

    test('対象が無い `-name` は無視される', () => {
      expect(mergeSet('gutter', '-shadow')).toEqual(['gutter']);
    });
  });

  describe('配列入力（内部 API 用途）', () => {
    test('文字列配列をそのまま受け付ける', () => {
      expect(mergeSet(undefined, ['hov', 'transition'])).toEqual(['hov', 'transition']);
    });

    test('配列要素内のスペース区切りも展開する', () => {
      expect(mergeSet(undefined, ['plain hov', 'transition'])).toEqual(['plain', 'hov', 'transition']);
    });

    test('配列内の `-name` も除外として扱われる', () => {
      expect(mergeSet(undefined, ['hov', 'transition', '-hov'])).toEqual(['transition']);
    });

    test('base 文字列と value 配列を結合できる', () => {
      expect(mergeSet('plain', ['hov', 'transition'])).toEqual(['plain', 'hov', 'transition']);
    });

    test('base 配列と value 配列の組み合わせ', () => {
      expect(mergeSet(['plain', 'hov'], ['transition', '-hov'])).toEqual(['plain', 'transition']);
    });

    test('空配列は空配列を返す', () => {
      expect(mergeSet(undefined, [])).toEqual([]);
    });
  });

  describe('入力が falsy', () => {
    test('すべて null は空配列', () => {
      expect(mergeSet(null, null)).toEqual([]);
    });

    test('すべて undefined は空配列', () => {
      expect(mergeSet(undefined, undefined)).toEqual([]);
    });

    test('base/value が false でも空配列', () => {
      expect(mergeSet(false, false)).toEqual([]);
    });

    test('base のみ指定', () => {
      expect(mergeSet('gutter', undefined)).toEqual(['gutter']);
    });

    test('value のみ指定', () => {
      expect(mergeSet(undefined, 'gutter')).toEqual(['gutter']);
    });
  });
});
