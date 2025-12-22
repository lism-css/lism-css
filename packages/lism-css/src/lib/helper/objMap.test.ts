import { describe, test, expect } from 'vitest';
import objMap from './objMap';

describe('objMap', () => {
	test('オブジェクトの各値に関数を適用して変換する', () => {
		const input = { a: 1, b: 2, c: 3 };
		const result = objMap(input, (val: number) => val * 2);
		expect(result).toEqual({ a: 2, b: 4, c: 6 });
	});

	test('文字列値を変換する', () => {
		const input = { name: 'alice', city: 'tokyo' };
		const result = objMap(input, (val: string) => val.toUpperCase());
		expect(result).toEqual({ name: 'ALICE', city: 'TOKYO' });
	});

	test('空オブジェクトの場合、空オブジェクトを返す', () => {
		const input = {};
		const result = objMap(input, (val: unknown) => val);
		expect(result).toEqual({});
	});

	test('元のオブジェクトを変更する（破壊的）', () => {
		const input = { x: 10, y: 20 };
		const result = objMap(input, (val: number) => val + 5);
		expect(result).toBe(input); // 同じ参照
		expect(input).toEqual({ x: 15, y: 25 }); // 元のオブジェクトが変更される
	});

	test('複雑な値の変換', () => {
		const input = { a: [1, 2], b: [3, 4] };
		const result = objMap(input, (val: number[]) => val.length);
		expect(result).toEqual({ a: 2, b: 2 });
	});

	test('callbackが値とキーを受け取る場合（拡張）', () => {
		// 現在の実装では callback は値のみを受け取るが、
		// 一般的な array_map 的な実装ではキーも渡すことがある
		const input = { a: 1, b: 2 };
		const result = objMap(input, (val: number) => val * 10);
		expect(result).toEqual({ a: 10, b: 20 });
	});

	test('異なる型の値が混在するオブジェクト', () => {
		const input = { num: 42, str: 'test', bool: true };
		const result = objMap(input, (val: unknown) => String(val));
		expect(result).toEqual({ num: '42', str: 'test', bool: 'true' });
	});

	test('undefinedやnullを含むオブジェクト', () => {
		const input = { a: null, b: undefined, c: 0 };
		const result = objMap(input, (val: unknown) => val ?? 'default');
		expect(result).toEqual({ a: 'default', b: 'default', c: 0 });
	});
});

