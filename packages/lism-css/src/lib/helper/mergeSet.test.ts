import { describe, test, expect } from 'vitest';
import mergeSet from './mergeSet';

describe('mergeSet', () => {
  describe('base / set の正規化', () => {
    test('単一の文字列', () => {
      expect(mergeSet(undefined, 'gutter', null)).toEqual(['gutter']);
    });

    test('カンマ区切りの文字列を分割', () => {
      expect(mergeSet(undefined, 'hov,transition', null)).toEqual(['hov', 'transition']);
    });

    test('カンマ+スペースの文字列を分割してトリム', () => {
      expect(mergeSet(undefined, 'hov, transition, shadow', null)).toEqual(['hov', 'transition', 'shadow']);
    });

    test('空白区切りの文字列を分割', () => {
      expect(mergeSet(undefined, 'plain hov', null)).toEqual(['plain', 'hov']);
    });

    test('配列をそのまま返す', () => {
      expect(mergeSet(undefined, ['hov', 'transition'], null)).toEqual(['hov', 'transition']);
    });

    test('配列要素内のカンマ区切り・空白区切り文字列も展開する', () => {
      expect(mergeSet(undefined, ['plain hov', 'transition,shadow'], null)).toEqual(['plain', 'hov', 'transition', 'shadow']);
    });

    test('空文字列は空配列', () => {
      expect(mergeSet(undefined, '', null)).toEqual([]);
    });

    test('空白のみの要素はフィルタされる', () => {
      expect(mergeSet(undefined, 'hov, , shadow', null)).toEqual(['hov', 'shadow']);
    });

    test('base と set は重複除去して結合される', () => {
      expect(mergeSet('plain hov', ['hov', 'gutter'], null)).toEqual(['plain', 'hov', 'gutter']);
    });
  });

  describe('base + set + unset 合成', () => {
    test('base のみでも unset で除外できる', () => {
      expect(mergeSet('plain hov', undefined, 'hov')).toEqual(['plain']);
    });

    test('base に set を追加しつつ unset で1つ除外', () => {
      expect(mergeSet('plain hov', 'gutter', 'hov')).toEqual(['plain', 'gutter']);
    });

    test('unset 文字列で1つ除外', () => {
      expect(mergeSet(undefined, ['hov', 'transition', 'shadow'], 'shadow')).toEqual(['hov', 'transition']);
    });

    test('unset 配列で複数除外', () => {
      expect(mergeSet(undefined, ['hov', 'transition', 'shadow'], ['hov', 'shadow'])).toEqual(['transition']);
    });

    test('unset で全て除外すると空配列', () => {
      expect(mergeSet('gutter', undefined, 'gutter')).toEqual([]);
    });

    test('unset にカンマ区切りと空白区切りを混在指定できる', () => {
      expect(mergeSet(undefined, ['hov', 'transition', 'shadow'], 'hov, shadow')).toEqual(['transition']);
    });

    test('unset に set に無い値を指定しても無視される', () => {
      expect(mergeSet('gutter', undefined, 'shadow')).toEqual(['gutter']);
    });
  });

  describe('入力が falsy', () => {
    test('すべて null は空配列', () => {
      expect(mergeSet(null, null, null)).toEqual([]);
    });

    test('すべて undefined は空配列', () => {
      expect(mergeSet(undefined, undefined, undefined)).toEqual([]);
    });

    test('base/set が false でも空配列', () => {
      expect(mergeSet(false, false, null)).toEqual([]);
    });

    test('base/set が無い場合、unset だけ指定しても空配列', () => {
      expect(mergeSet(null, null, 'gutter')).toEqual([]);
    });
  });
});
