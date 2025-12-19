import { describe, it, expect } from 'vitest';
import isEmptyObj from './isEmptyObj';

describe('isEmptyObj', () => {
	it('should return true for empty objects', () => {
		expect(isEmptyObj({})).toBe(true);
	});

	it('should return false for objects with properties', () => {
		expect(isEmptyObj({ a: 1 })).toBe(false);
		expect(isEmptyObj({ a: 1, b: 2 })).toBe(false);
		expect(isEmptyObj({ key: 'value' })).toBe(false);
	});

	it('should return false for objects with falsy values', () => {
		expect(isEmptyObj({ a: null })).toBe(false);
		expect(isEmptyObj({ a: undefined })).toBe(false);
		expect(isEmptyObj({ a: 0 })).toBe(false);
		expect(isEmptyObj({ a: false })).toBe(false);
		expect(isEmptyObj({ a: '' })).toBe(false);
	});

	it('should return true for empty arrays', () => {
		expect(isEmptyObj([])).toBe(true);
	});

	it('should return false for non-empty arrays', () => {
		expect(isEmptyObj([1, 2, 3])).toBe(false);
		expect(isEmptyObj(['a'])).toBe(false);
	});

	it('should only check own properties, not inherited ones', () => {
		const proto = { inherited: true };
		const obj = Object.create(proto);
		expect(isEmptyObj(obj)).toBe(true);

		obj.own = true;
		expect(isEmptyObj(obj)).toBe(false);
	});
});
