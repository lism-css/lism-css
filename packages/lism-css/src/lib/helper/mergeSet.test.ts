import { describe, test, expect } from 'vitest';
import mergeSet from './mergeSet';

describe('mergeSet', () => {
  describe('set のみ', () => {
    test('単一の文字列', () => {
      expect(mergeSet('gutter', null)).toEqual(['gutter']);
    });

    test('カンマ区切りの文字列を分割', () => {
      expect(mergeSet('hov,transition', null)).toEqual(['hov', 'transition']);
    });

    test('カンマ+スペースの文字列を分割してトリム', () => {
      expect(mergeSet('hov, transition, shadow', null)).toEqual(['hov', 'transition', 'shadow']);
    });

    test('配列をそのまま返す', () => {
      expect(mergeSet(['hov', 'transition'], null)).toEqual(['hov', 'transition']);
    });

    test('空文字列は空配列', () => {
      expect(mergeSet('', null)).toEqual([]);
    });

    test('空白のみの要素はフィルタされる', () => {
      expect(mergeSet('hov, , shadow', null)).toEqual(['hov', 'shadow']);
    });
  });

  describe('set + unset 合成', () => {
    test('unset 文字列で1つ除外', () => {
      expect(mergeSet(['hov', 'transition', 'shadow'], 'shadow')).toEqual(['hov', 'transition']);
    });

    test('unset 配列で複数除外', () => {
      expect(mergeSet(['hov', 'transition', 'shadow'], ['hov', 'shadow'])).toEqual(['transition']);
    });

    test('unset で全て除外すると空配列', () => {
      expect(mergeSet('gutter', 'gutter')).toEqual([]);
    });

    test('unset にカンマ区切り文字列を指定', () => {
      expect(mergeSet(['hov', 'transition', 'shadow'], 'hov, shadow')).toEqual(['transition']);
    });

    test('unset に set に無い値を指定しても無視される', () => {
      expect(mergeSet('gutter', 'shadow')).toEqual(['gutter']);
    });
  });

  describe('set が falsy', () => {
    test('null は空配列', () => {
      expect(mergeSet(null, null)).toEqual([]);
    });

    test('undefined は空配列', () => {
      expect(mergeSet(undefined, undefined)).toEqual([]);
    });

    test('false は空配列', () => {
      expect(mergeSet(false, null)).toEqual([]);
    });

    test('set が無い場合、unset だけ指定しても空配列', () => {
      expect(mergeSet(null, 'gutter')).toEqual([]);
    });
  });
});
