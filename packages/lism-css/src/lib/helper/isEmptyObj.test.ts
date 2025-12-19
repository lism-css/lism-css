import { describe, test, expect } from 'vitest';
import isEmptyObj from './isEmptyObj';

describe('isEmptyObj', () => {
	test('空のオブジェクトの場合、trueを返す', () => {
		expect(isEmptyObj({})).toBe(true);
	});

	test('プロパティを持つオブジェクトの場合、falseを返す', () => {
		expect(isEmptyObj({ a: 1 })).toBe(false);
		expect(isEmptyObj({ a: 1, b: 2 })).toBe(false);
		expect(isEmptyObj({ key: 'value' })).toBe(false);
	});

	test('falsyな値を持つオブジェクトの場合、falseを返す', () => {
		expect(isEmptyObj({ a: null })).toBe(false);
		expect(isEmptyObj({ a: undefined })).toBe(false);
		expect(isEmptyObj({ a: 0 })).toBe(false);
		expect(isEmptyObj({ a: false })).toBe(false);
		expect(isEmptyObj({ a: '' })).toBe(false);
	});

	test('空の配列の場合、trueを返す', () => {
		expect(isEmptyObj([])).toBe(true);
	});

	test('要素を持つ配列の場合、falseを返す', () => {
		expect(isEmptyObj([1, 2, 3])).toBe(false);
		expect(isEmptyObj(['a'])).toBe(false);
	});

	test('継承されたプロパティではなく、自身のプロパティのみをチェックする', () => {
		const proto = { inherited: true };
		const obj = Object.create(proto);
		expect(isEmptyObj(obj)).toBe(true);

		obj.own = true;
		expect(isEmptyObj(obj)).toBe(false);
	});
});
