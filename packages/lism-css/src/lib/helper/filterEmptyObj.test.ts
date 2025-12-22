import { describe, test, expect } from 'vitest';
import filterEmptyObj from './filterEmptyObj';

describe('filterEmptyObj', () => {
	describe('空の値の削除', () => {
		test('空文字列のプロパティを削除', () => {
			const input = { a: 'foo', b: '', c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', c: 'bar' });
		});

		test('null のプロパティを削除', () => {
			const input = { a: 'foo', b: null, c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', c: 'bar' });
		});

		test('undefined のプロパティを削除', () => {
			const input = { a: 'foo', b: undefined, c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', c: 'bar' });
		});

		test('空文字列、null、undefined を同時に削除', () => {
			const input = { a: 'foo', b: '', c: null, d: undefined, e: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', e: 'bar' });
		});
	});

	describe('0 の扱い', () => {
		test('0 は削除されない', () => {
			const input = { a: 0, b: '', c: 1 };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 0, c: 1 });
		});

		test('負の数値も保持される', () => {
			const input = { a: -1, b: '', c: 0 };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: -1, c: 0 });
		});

		test('小数も保持される', () => {
			const input = { a: 3.14, b: null, c: 0.0 };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 3.14, c: 0.0 });
		});
	});

	describe('オブジェクトの処理', () => {
		test('空オブジェクトのプロパティを削除', () => {
			const input = { a: 'foo', b: {}, c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', c: 'bar' });
		});

		test('ネストしたオブジェクトで空のものを削除', () => {
			const input = {
				a: 'foo',
				b: { x: 1 },
				c: {},
				d: 'bar',
			};
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', b: { x: 1 }, d: 'bar' });
		});

		test('空でないオブジェクトは保持される', () => {
			const input = {
				a: 'foo',
				b: { x: 'test', y: 42 },
			};
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', b: { x: 'test', y: 42 } });
		});
	});

	describe('配列の処理', () => {
		test('空配列は isEmptyObj で空と判定されて削除される', () => {
			const input = { a: 'foo', b: [], c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', c: 'bar' });
		});

		test('空でない配列は保持される', () => {
			const input = { a: 'foo', b: [1, 2, 3], c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', b: [1, 2, 3], c: 'bar' });
		});

		test('要素が1つの配列も保持される', () => {
			const input = { a: [0] };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: [0] });
		});
	});

	describe('真偽値の処理', () => {
		test('false は保持される', () => {
			const input = { a: false, b: '', c: true };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: false, c: true });
		});

		test('true は保持される', () => {
			const input = { a: true, b: null };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: true });
		});
	});

	describe('非破壊的な動作', () => {
		test('元のオブジェクトを変更しない（非破壊的）', () => {
			const input = { a: 'foo', b: '', c: 'bar' };
			const result = filterEmptyObj(input);
			expect(result).not.toBe(input); // 異なる参照
			expect(input).toEqual({ a: 'foo', b: '', c: 'bar' }); // 元のオブジェクトは変更されない
			expect(result).toEqual({ a: 'foo', c: 'bar' }); // 結果は空の値が除外される
		});

		test('元のオブジェクトのプロパティが保持される', () => {
			const input = { a: 'foo', b: null };
			const result = filterEmptyObj(input);
			expect('b' in input).toBe(true); // 元のオブジェクトには残る
			expect('b' in result).toBe(false); // 結果には含まれない
		});
	});

	describe('複合的なケース', () => {
		test('さまざまな型の値が混在', () => {
			const input = {
				str: 'text',
				emptyStr: '',
				num: 42,
				zero: 0,
				nullVal: null,
				undefinedVal: undefined,
				bool: true,
				falseBool: false,
				arr: [1, 2],
				emptyArr: [],
				obj: { x: 1 },
				emptyObj: {},
			};
			const result = filterEmptyObj(input);
			expect(result).toEqual({
				str: 'text',
				num: 42,
				zero: 0,
				bool: true,
				falseBool: false,
				arr: [1, 2],
				obj: { x: 1 },
			});
		});

		test('すべてが空の値の場合は空オブジェクトを返す', () => {
			const input = { a: '', b: null, c: undefined, d: {} };
			const result = filterEmptyObj(input);
			expect(result).toEqual({});
		});

		test('空オブジェクトを渡すと空オブジェクトを返す', () => {
			const input = {};
			const result = filterEmptyObj(input);
			expect(result).toEqual({});
			expect(result).not.toBe(input); // 非破壊的なので異なる参照
		});
	});

	describe('特殊なケース', () => {
		test('プロトタイプチェーンのプロパティは処理しない', () => {
			const proto = { inherited: 'value' };
			const input = Object.create(proto);
			input.own = 'test';
			input.empty = '';

			const result = filterEmptyObj(input);
			expect(result).toEqual({ own: 'test' });
			expect('inherited' in result).toBe(true); // プロトタイプチェーンには残る
			expect(result.hasOwnProperty('inherited')).toBe(false);
		});

		test('シンボルキーは処理されない（for...in で列挙されない）', () => {
			const sym = Symbol('test');
			const input = { a: 'foo', b: '', [sym]: 'symbol' };
			const result = filterEmptyObj(input);
			expect(result).toEqual({ a: 'foo', [sym]: 'symbol' });
		});

		test('非常に多くのプロパティ', () => {
			const input: Record<string, any> = {};
			for (let i = 0; i < 100; i++) {
				input[`key${i}`] = i % 2 === 0 ? `value${i}` : '';
			}
			const result = filterEmptyObj(input);
			expect(Object.keys(result).length).toBe(50);
		});
	});

	describe('実際の使用例', () => {
		test('フォームデータのクリーンアップ', () => {
			const formData = {
				name: 'John',
				email: 'john@example.com',
				phone: '',
				address: null,
				age: 0,
				newsletter: false,
			};
			const result = filterEmptyObj(formData);
			expect(result).toEqual({
				name: 'John',
				email: 'john@example.com',
				age: 0,
				newsletter: false,
			});
		});

		test('API リクエストパラメータのクリーンアップ', () => {
			const params = {
				query: 'search term',
				page: 1,
				limit: 0,
				sort: '',
				filters: {},
			};
			const result = filterEmptyObj(params);
			expect(result).toEqual({
				query: 'search term',
				page: 1,
				limit: 0,
			});
		});
	});
});

