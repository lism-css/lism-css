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

			test('複数のキーが同じ値を持つ場合、最初に見つかったキーを返す', () => {
				const utils = { a: 'value', b: 'value', c: 'other' };
				const result = getUtilKey(utils, 'value');
				// Object.entries の順序に依存するが、a または b のいずれかが返される
				expect(['a', 'b']).toContain(result);
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

	describe('値の型のバリエーション', () => {
		test('数値の値を持つ utils', () => {
			const utils = { zero: 0, one: 1, negative: -1 };
			expect(getUtilKey(utils, 'zero')).toBe('zero');
			expect(getUtilKey(utils, 'one')).toBe('one');
		});

		test('真偽値の値を持つ utils', () => {
			const utils = { t: true, f: false };
			expect(getUtilKey(utils, 't')).toBe('t');
			expect(getUtilKey(utils, 'f')).toBe('f');
		});

		test('null や undefined の値を持つ utils', () => {
			const utils = { n: null, u: undefined };
			expect(getUtilKey(utils, 'n')).toBe('n');
			expect(getUtilKey(utils, 'u')).toBe('u');
		});
	});

	describe('エッジケース', () => {
		test('空文字列のキーや値', () => {
			const utils = { '': 'empty', key: '' };
			expect(getUtilKey(utils, '')).toBe('');
			expect(getUtilKey(utils, 'empty')).toBe('');
			expect(getUtilKey(utils, 'key')).toBe('key');
		});

		test('特殊文字を含むキーや値', () => {
			const utils = { 'foo-bar': 'baz_qux', 'test:hover': 'active' };
			expect(getUtilKey(utils, 'foo-bar')).toBe('foo-bar');
			expect(getUtilKey(utils, 'baz_qux')).toBe('foo-bar');
			expect(getUtilKey(utils, 'test:hover')).toBe('test:hover');
			expect(getUtilKey(utils, 'active')).toBe('test:hover');
		});

		test('数値のキーを持つ utils', () => {
			const utils = { 1: 'one', 2: 'two' };
			expect(getUtilKey(utils, '1')).toBe('1');
			expect(getUtilKey(utils, 'one')).toBe('1');
			expect(getUtilKey(utils, '1', true)).toBe('one');
		});

		test('大量のエントリを持つ utils', () => {
			const utils: Record<string, string> = {};
			for (let i = 0; i < 100; i++) {
				utils[`key${i}`] = `value${i}`;
			}
			expect(getUtilKey(utils, 'key50')).toBe('key50');
			expect(getUtilKey(utils, 'value50')).toBe('key50');
		});
	});

	describe('実際の使用例', () => {
		test('CSS utility のマッピング', () => {
			const utils = {
				auto: 'auto',
				s: 'start',
				c: 'center',
				e: 'end',
				sb: 'space-between',
				sa: 'space-around',
			};

			// utils モード: キー（省略形）を取得
			expect(getUtilKey(utils, 'c')).toBe('c');
			expect(getUtilKey(utils, 'center')).toBe('c');

			// shorthand モード: 値（完全形）を取得
			expect(getUtilKey(utils, 'c', true)).toBe('center');
			expect(getUtilKey(utils, 's', true)).toBe('start');
		});

		test('プリセット値の変換', () => {
			const utils = {
				xs: '0.5rem',
				sm: '1rem',
				md: '1.5rem',
				lg: '2rem',
			};

			// utils モード
			expect(getUtilKey(utils, 'sm')).toBe('sm');
			expect(getUtilKey(utils, '1rem')).toBe('sm');

			// shorthand モード
			expect(getUtilKey(utils, 'sm', true)).toBe('1rem');
			expect(getUtilKey(utils, 'lg', true)).toBe('2rem');
		});
	});
});
