import { describe, it, expect } from 'vitest';
import hasSomeKeys from './hasSomeKeys';

describe('hasSomeKeys', () => {
	it('should return true when object has at least one of the keys', () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(hasSomeKeys(obj, ['a', 'd'])).toBe(true);
		expect(hasSomeKeys(obj, ['b'])).toBe(true);
		expect(hasSomeKeys(obj, ['a', 'b', 'c'])).toBe(true);
	});

	it('should return false when object has none of the keys', () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(hasSomeKeys(obj, ['d', 'e'])).toBe(false);
		expect(hasSomeKeys(obj, ['x'])).toBe(false);
	});

	it('should treat arrays as objects with numeric keys (index presence)', () => {
		const array = ['a', 'b', 'c'];
		expect(hasSomeKeys(array, [1])).toBe(true);
		expect(hasSomeKeys(array, [5])).toBe(false);
	});

	it('should return false when keys array is empty', () => {
		const obj = { a: 1, b: 2 };
		expect(hasSomeKeys(obj, [])).toBe(false);
	});

	it('should only check own properties, not inherited ones', () => {
		const proto = { inherited: true };
		const obj = Object.create(proto);
		obj.own = true;
		expect(hasSomeKeys(obj, ['own'])).toBe(true);
		expect(hasSomeKeys(obj, ['inherited'])).toBe(false);
	});
});
