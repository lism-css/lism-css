import { describe, it, expect } from 'vitest';
import hasKeys from './hasKeys';

describe('hasKeys', () => {
	it('should return true when object has at least one of the keys', () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(hasKeys(obj, ['a', 'd'])).toBe(true);
		expect(hasKeys(obj, ['b'])).toBe(true);
		expect(hasKeys(obj, ['a', 'b', 'c'])).toBe(true);
	});

	it('should return false when object has none of the keys', () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(hasKeys(obj, ['d', 'e'])).toBe(false);
		expect(hasKeys(obj, ['x'])).toBe(false);
	});

	it('should treat arrays as objects with numeric keys (index presence)', () => {
		const array = ['a', 'b', 'c'];
		expect(hasKeys(array, [1])).toBe(true);
		expect(hasKeys(array, [5])).toBe(false);
	});

	it('should return false when keys array is empty', () => {
		const obj = { a: 1, b: 2 };
		expect(hasKeys(obj, [])).toBe(false);
	});

	it('should only check own properties, not inherited ones', () => {
		const proto = { inherited: true };
		const obj = Object.create(proto);
		obj.own = true;
		expect(hasKeys(obj, ['own'])).toBe(true);
		expect(hasKeys(obj, ['inherited'])).toBe(false);
	});
});
