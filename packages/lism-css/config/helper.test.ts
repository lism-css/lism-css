import { describe, test, expect } from 'vitest';
import { objDeepMerge, arrayConvertToSet } from './helper.js';

describe('objDeepMerge', () => {
	test('基本的なマージが正しく動作する', () => {
		const origin = { a: 1, b: 2 };
		const source = { b: 3, c: 4 };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: 1, b: 3, c: 4 });
	});

	test('ネストしたオブジェクトを深くマージする', () => {
		const origin = { a: { b: 1, c: 2 }, d: 3 };
		const source = { a: { b: 10, e: 5 }, f: 6 };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: { b: 10, c: 2, e: 5 }, d: 3, f: 6 });
	});

	test('深くネストしたオブジェクトを正しくマージする', () => {
		const origin = { a: { b: { c: 1 } } };
		const source = { a: { b: { d: 2 } } };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
	});

	test('originが空オブジェクトの場合、sourceをそのまま返す', () => {
		const origin = {};
		const source = { a: 1, b: 2 };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: 1, b: 2 });
	});

	test('sourceが空オブジェクトの場合、originをそのまま返す', () => {
		const origin = { a: 1, b: 2 };
		const source = {};
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: 1, b: 2 });
	});

	test('originに存在しないキーが追加される', () => {
		const origin = { a: 1 };
		const source = { b: 2, c: 3 };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	test('値がオブジェクトから配列に上書きされる', () => {
		const origin = { a: { b: 1 } };
		const source = { a: [1, 2, 3] };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: [1, 2, 3] });
	});

	test('値が配列からオブジェクトに上書きされる', () => {
		const origin = { a: [1, 2, 3] };
		const source = { a: { b: 1 } };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: { b: 1 } });
	});

	test('値がプリミティブ型の場合、sourceの値で上書きされる', () => {
		const origin = { a: 1, b: 'hello' };
		const source = { a: 2, b: 'world' };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: 2, b: 'world' });
	});

	test('originValueがnullまたはundefinedの場合、sourceValueを追加する', () => {
		const origin = { a: null, b: undefined };
		const source = { a: 1, b: 2, c: 3 };
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	test('元のオブジェクトが変更されないことを確認', () => {
		const origin = { a: 1, b: { c: 2 } };
		const source = { b: { d: 3 } };
		const result = objDeepMerge(origin, source);
		expect(origin).toEqual({ a: 1, b: { c: 2 } });
		expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
	});

	test('複雑なネスト構造のマージ', () => {
		const origin = {
			level1: {
				level2: {
					a: 1,
					b: 2,
				},
				c: 3,
			},
			d: 4,
		};
		const source = {
			level1: {
				level2: {
					b: 20,
					e: 5,
				},
				f: 6,
			},
			g: 7,
		};
		const result = objDeepMerge(origin, source);
		expect(result).toEqual({
			level1: {
				level2: {
					a: 1,
					b: 20,
					e: 5,
				},
				c: 3,
				f: 6,
			},
			d: 4,
			g: 7,
		});
	});
});
describe('arrayConvertToSet', () => {
	test('配列をSetに変換する', () => {
		const input = [1, 2, 3];
		const result = arrayConvertToSet(input);
		expect(result).toBeInstanceOf(Set);
		expect(result).toEqual(new Set([1, 2, 3]));
	});

	test('重複した要素を持つ配列をSetに変換する', () => {
		const input = [1, 2, 2, 3, 3, 3];
		const result = arrayConvertToSet(input);
		expect(result).toEqual(new Set([1, 2, 3]));
	});

	test('オブジェクト内の配列をSetに変換する', () => {
		const input = { a: [1, 2, 3], b: [4, 5, 6] };
		const result = arrayConvertToSet(input);
		expect(result.a).toEqual(new Set([1, 2, 3]));
		expect(result.b).toEqual(new Set([4, 5, 6]));
	});

	test('ネストしたオブジェクト内の配列をSetに変換する', () => {
		const input = {
			level1: {
				level2: {
					arr: [1, 2, 3],
				},
			},
		};
		const result = arrayConvertToSet(input);
		expect(result.level1.level2.arr).toEqual(new Set([1, 2, 3]));
	});

	test('配列とオブジェクトが混在する場合', () => {
		const input = {
			a: [1, 2, 3],
			b: {
				c: [4, 5, 6],
				d: 'string',
			},
			e: 100,
		};
		const result = arrayConvertToSet(input);
		expect(result.a).toEqual(new Set([1, 2, 3]));
		expect(result.b.c).toEqual(new Set([4, 5, 6]));
		expect(result.b.d).toBe('string');
		expect(result.e).toBe(100);
	});

	test('プリミティブ値はそのまま返す', () => {
		expect(arrayConvertToSet(1)).toBe(1);
		expect(arrayConvertToSet('string')).toBe('string');
		expect(arrayConvertToSet(true)).toBe(true);
		expect(arrayConvertToSet(null)).toBe(null);
		expect(arrayConvertToSet(undefined)).toBe(undefined);
	});

	test('空配列をSetに変換する', () => {
		const input: never[] = [];
		const result = arrayConvertToSet(input);
		expect(result).toEqual(new Set());
	});

	test('空オブジェクトをそのまま返す', () => {
		const input = {};
		const result = arrayConvertToSet(input);
		expect(result).toEqual({});
	});

	test('深くネストしたオブジェクトと配列の変換', () => {
		const input = {
			a: {
				b: {
					c: [1, 2, 3],
					d: {
						e: [4, 5, 6],
					},
				},
			},
		};
		const result = arrayConvertToSet(input);
		expect(result.a.b.c).toEqual(new Set([1, 2, 3]));
		expect(result.a.b.d.e).toEqual(new Set([4, 5, 6]));
	});

	test('配列内にオブジェクトがある場合（配列自体がSetになる）', () => {
		const obj = { value: 1 };
		const input = [obj, 2, 3];
		const result = arrayConvertToSet(input);
		expect(result).toEqual(new Set([obj, 2, 3]));
	});

	test('元のオブジェクトが変更されないことを確認', () => {
		const input = { a: [1, 2, 3] };
		const result = arrayConvertToSet(input);
		expect(Array.isArray(input.a)).toBe(true);
		expect(result.a).toBeInstanceOf(Set);
	});

	test('複数階層のオブジェクトと配列が混在するケース', () => {
		const input = {
			colors: ['red', 'blue', 'green'],
			sizes: {
				small: [1, 2, 3],
				large: [10, 20, 30],
			},
			config: {
				enabled: true,
				tags: ['tag1', 'tag2'],
			},
		};
		const result = arrayConvertToSet(input);
		expect(result.colors).toEqual(new Set(['red', 'blue', 'green']));
		expect(result.sizes.small).toEqual(new Set([1, 2, 3]));
		expect(result.sizes.large).toEqual(new Set([10, 20, 30]));
		expect(result.config.enabled).toBe(true);
		expect(result.config.tags).toEqual(new Set(['tag1', 'tag2']));
	});
});
