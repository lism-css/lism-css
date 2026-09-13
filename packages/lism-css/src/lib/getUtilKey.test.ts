import { describe, test, expect } from 'vitest';
import getUtilKey from './getUtilKey';

describe('getUtilKey', () => {
  describe('utils モード（isShorthand = false）', () => {
    describe('キーから検索', () => {
      test('utils のキーが存在する場合、キーを返す', () => {
        const utils = { val: 'value', short: 'shorthand' };
        expect(getUtilKey(utils, 'val')).toBe('val');
        expect(getUtilKey(utils, 'short')).toBe('short');
      });

      test('utils のキーが存在しない場合、値から検索を試みる', () => {
        const utils = { val: 'value', short: 'shorthand' };
        // 'value' というキーは存在しないが、値として存在するので 'val' を返す
        expect(getUtilKey(utils, 'value')).toBe('val');
        expect(getUtilKey(utils, 'shorthand')).toBe('short');
      });

      test('キーも値も見つからない場合、空文字列を返す', () => {
        const utils = { val: 'value' };
        expect(getUtilKey(utils, 'notfound')).toBe('');
      });
    });

    describe('値から検索', () => {
      test('値に一致するキーを返す', () => {
        const utils = { sm: 'small', md: 'medium', lg: 'large' };
        expect(getUtilKey(utils, 'small')).toBe('sm');
        expect(getUtilKey(utils, 'medium')).toBe('md');
        expect(getUtilKey(utils, 'large')).toBe('lg');
      });
    });

    describe('優先順位: キー検索 > 値検索', () => {
      test('キーと値の両方が存在する場合、キーを優先', () => {
        const utils = { value: 'something', key: 'value' };
        // 'value' というキーが存在するので、値検索より優先される
        expect(getUtilKey(utils, 'value')).toBe('value');
      });
    });
  });

  describe('shorthand モード（isShorthand = true）', () => {
    describe('キーから検索', () => {
      test('utils のキーが存在する場合、対応する値を返す', () => {
        const utils = { val: 'value', short: 'shorthand' };
        expect(getUtilKey(utils, 'val', true)).toBe('value');
        expect(getUtilKey(utils, 'short', true)).toBe('shorthand');
      });

      test('utils のキーが存在しない場合、空文字列を返す', () => {
        const utils = { val: 'value' };
        // shorthand モードでは値からの検索は行わない
        expect(getUtilKey(utils, 'notfound', true)).toBe('');
        expect(getUtilKey(utils, 'value', true)).toBe('');
      });
    });

    describe('値から検索は行わない', () => {
      test('値が存在していても、キーでなければ空文字列', () => {
        const utils = { sm: 'small', md: 'medium' };
        // 'small' は値として存在するが、shorthand モードでは検索しない
        expect(getUtilKey(utils, 'small', true)).toBe('');
        expect(getUtilKey(utils, 'medium', true)).toBe('');
      });
    });
  });

  describe('utils モードと shorthand モードの違い', () => {
    test('同じ utils とキーで異なる結果を返す', () => {
      const utils = { val: 'value' };

      // utils モード: キーを返す
      expect(getUtilKey(utils, 'val', false)).toBe('val');

      // shorthand モード: 値を返す
      expect(getUtilKey(utils, 'val', true)).toBe('value');
    });

    test('キーが存在しない場合の挙動の違い', () => {
      const utils = { val: 'value' };

      // utils モード: 値から検索してキーを返す
      expect(getUtilKey(utils, 'value', false)).toBe('val');

      // shorthand モード: 空文字列を返す
      expect(getUtilKey(utils, 'value', true)).toBe('');
    });
  });
});
