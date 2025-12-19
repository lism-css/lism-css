import { describe, test, expect } from 'vitest';
import hasSomeKeys from './hasSomeKeys';

describe('hasSomeKeys', () => {
	test('オブジェクトが指定されたキーのいずれかを持っている場合、trueを返す', () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(hasSomeKeys(obj, ['a', 'd'])).toBe(true);
		expect(hasSomeKeys(obj, ['b'])).toBe(true);
		expect(hasSomeKeys(obj, ['a', 'b', 'c'])).toBe(true);
	});

	test('オブジェクトが指定されたキーを1つも持っていない場合、falseを返す', () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(hasSomeKeys(obj, ['d', 'e'])).toBe(false);
		expect(hasSomeKeys(obj, ['x'])).toBe(false);
	});

	test('配列を数値キーを持つオブジェクトとして扱う', () => {
		const array = ['a', 'b', 'c'];
		expect(hasSomeKeys(array, [1])).toBe(true);
		expect(hasSomeKeys(array, [5])).toBe(false);
	});

	test('キーの配列が空の場合、falseを返す', () => {
		const obj = { a: 1, b: 2 };
		expect(hasSomeKeys(obj, [])).toBe(false);
	});

	test('継承されたプロパティではなく、自身のプロパティのみをチェックする', () => {
		const proto = { inherited: true };
		const obj = Object.create(proto);
		obj.own = true;
		expect(hasSomeKeys(obj, ['own'])).toBe(true);
		expect(hasSomeKeys(obj, ['inherited'])).toBe(false);
	});
});
