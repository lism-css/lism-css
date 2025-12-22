import { describe, test, expect } from 'vitest';
import atts from './atts';

describe('atts', () => {
	describe('文字列の処理', () => {
		test('単一の文字列を返す', () => {
			expect(atts('foo')).toBe('foo');
		});

		test('複数の文字列をスペース区切りで結合', () => {
			expect(atts('foo', 'bar', 'baz')).toBe('foo bar baz');
		});

		test('文字列内のスペースを分割して処理', () => {
			expect(atts('foo bar', 'baz')).toBe('foo bar baz');
		});

		test('前後の空白をトリム', () => {
			expect(atts('  foo  ', '  bar  ')).toBe('foo bar');
		});

		test('空文字列は無視される', () => {
			expect(atts('foo', '', 'bar')).toBe('foo bar');
		});
	});

	describe('数値の処理', () => {
		test('0 は falsy なので除外される', () => {
			expect(atts('foo', 0, 'bar')).toBe('foo bar');
		});

		test('正の数値', () => {
			expect(atts(1, 2, 3)).toBe('1 2 3');
		});

		test('負の数値', () => {
			expect(atts(-1, -2)).toBe('-1 -2');
		});
	});

	describe('配列の処理', () => {
		test('配列の要素を展開', () => {
			expect(atts(['foo', 'bar'])).toBe('foo bar');
		});

		test('配列とその他を混在', () => {
			expect(atts('foo', ['bar', 'baz'], 'qux')).toBe('foo bar baz qux');
		});

		test('配列内の null と undefined を除外', () => {
			expect(atts(['foo', null, 'bar', undefined, 'baz'])).toBe('foo bar baz');
		});

		test('配列内の 0 は残す（配列の filter では null != v で判定）', () => {
			expect(atts(['foo', 0, 'bar'])).toBe('foo 0 bar');
		});

		test('空配列は無視', () => {
			expect(atts('foo', [], 'bar')).toBe('foo bar');
		});

		test('ネストした配列は展開しない（1階層のみ）', () => {
			// Array.isArray でチェックしているので、ネストは対応していない
			expect(atts(['foo', ['bar', 'baz']])).toContain('foo');
		});
	});

	describe('Set の処理', () => {
		test('Set の要素を展開', () => {
			const set = new Set(['foo', 'bar', 'baz']);
			expect(atts(set)).toBe('foo bar baz');
		});

		test('Set とその他を混在', () => {
			const set = new Set(['bar', 'baz']);
			expect(atts('foo', set, 'qux')).toBe('foo bar baz qux');
		});

		test('空の Set は無視', () => {
			const set = new Set<string>();
			expect(atts('foo', set, 'bar')).toBe('foo bar');
		});
	});

	describe('オブジェクトの処理', () => {
		test('真の値を持つキーのみを含める', () => {
			expect(atts({ foo: true, bar: false, baz: true })).toBe('foo baz');
		});

		test('truthy な値を持つキーを含める', () => {
			expect(atts({ foo: 1, bar: 0, baz: 'yes', qux: '' })).toBe('foo baz');
		});

		test('オブジェクトとその他を混在', () => {
			expect(atts('foo', { bar: true, baz: false }, 'qux')).toBe('foo bar qux');
		});

		test('空オブジェクトは無視', () => {
			expect(atts('foo', {}, 'bar')).toBe('foo bar');
		});
	});

	describe('falsy な値の処理', () => {
		test('null は無視', () => {
			expect(atts('foo', null, 'bar')).toBe('foo bar');
		});

		test('undefined は無視', () => {
			expect(atts('foo', undefined, 'bar')).toBe('foo bar');
		});

		test('false は無視', () => {
			expect(atts('foo', false, 'bar')).toBe('foo bar');
		});

		test('0 は falsy なので除外される', () => {
			expect(atts('foo', 0, 'bar')).toBe('foo bar');
		});
	});

	describe('重複の削除', () => {
		test('重複する文字列を削除', () => {
			expect(atts('foo', 'bar', 'foo', 'baz', 'bar')).toBe('foo bar baz');
		});

		test('文字列内のスペースで分割された重複も削除', () => {
			expect(atts('foo bar', 'bar baz', 'foo')).toBe('foo bar baz');
		});

		test('配列内の重複も削除', () => {
			expect(atts(['foo', 'bar', 'foo'])).toBe('foo bar');
		});

		test('文字列と数値は異なる型として扱われる', () => {
			// Set では '1' と 1 は異なる値
			expect(atts('1', 1, '2', 2)).toBe('1 1 2 2');
		});
	});

	describe('複合的なケース', () => {
		test('すべての型を混在', () => {
			const set = new Set(['set-item']);
			const result = atts(
				'string',
				42,
				['array-item1', 'array-item2'],
				set,
				{ 'obj-true': true, 'obj-false': false },
				null,
				undefined
			);
			expect(result).toBe('string 42 array-item1 array-item2 set-item obj-true');
		});

		test('実際の使用例: 条件付きクラス名', () => {
			const isActive = true;
			const isDisabled = false;
			const result = atts('btn', isActive && 'active', isDisabled && 'disabled');
			expect(result).toBe('btn active');
		});

		test('オブジェクト形式と条件式形式が同じ結果を返す', () => {
			const isFoo = true;
			const isBar = false;

			// オブジェクト形式
			const result1 = atts({ foo: isFoo, bar: isBar });

			// 条件式形式
			const result2 = atts(isFoo && 'foo', isBar && 'bar');

			expect(result1).toBe(result2);
			expect(result1).toBe('foo');
		});

		test('オブジェクト形式と条件式形式が同じ結果を返す（複数の値）', () => {
			const isFoo = true;
			const isBar = true;
			const isBaz = false;

			const result1 = atts({ foo: isFoo, bar: isBar, baz: isBaz });
			const result2 = atts(isFoo && 'foo', isBar && 'bar', isBaz && 'baz');

			expect(result1).toBe(result2);
			expect(result1).toBe('foo bar');
		});

		test('オブジェクト形式と条件式形式が同じ結果を返す（すべてfalse）', () => {
			const isFoo = false;
			const isBar = false;

			const result1 = atts({ foo: isFoo, bar: isBar });
			const result2 = atts(isFoo && 'foo', isBar && 'bar');

			expect(result1).toBe(result2);
			expect(result1).toBe('');
		});

		test('オブジェクト形式と条件式形式が同じ結果を返す（他の引数と混在）', () => {
			const isFoo = true;
			const isBar = false;

			const result1 = atts('base', { foo: isFoo, bar: isBar }, 'end');
			const result2 = atts('base', isFoo && 'foo', isBar && 'bar', 'end');

			expect(result1).toBe(result2);
			expect(result1).toBe('base foo end');
		});

		test('空の引数は空文字列を返す', () => {
			expect(atts()).toBe('');
		});

		test('すべてが falsy な値の場合は空文字列', () => {
			expect(atts(null, undefined, false, '')).toBe('');
		});

		test('複雑な重複削除のケース', () => {
			expect(atts('a b c', ['b', 'c', 'd'], { a: true, e: true })).toBe('a b c d e');
		});
	});

	describe('エッジケース', () => {
		test('非常に長い文字列', () => {
			const long = 'a'.repeat(1000);
			expect(atts(long)).toBe(long);
		});

		test('大量の引数', () => {
			const args = Array(100).fill('class');
			expect(atts(...args)).toBe('class');
		});

		test('特殊文字を含む文字列', () => {
			expect(atts('foo-bar', 'baz_qux', 'test:hover')).toBe('foo-bar baz_qux test:hover');
		});

		test('数値の 0 と文字列の "0" の扱い', () => {
			// 0 は falsy なので除外され、'0' だけが残る
			expect(atts(0, '0')).toBe('0');
		});
	});
});

