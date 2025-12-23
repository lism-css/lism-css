import { describe, test, expect } from 'vitest';
import isPresetValue from './isPresetValue';

describe('isPresetValue', () => {
	describe('Set を使用した場合', () => {
		test('Set に含まれる値は true を返す', () => {
			const presets = new Set(['foo', 'bar', 'baz']);
			expect(isPresetValue(presets, 'foo')).toBe(true);
			expect(isPresetValue(presets, 'bar')).toBe(true);
			expect(isPresetValue(presets, 'baz')).toBe(true);
		});

		test('Set に含まれない値は false を返す', () => {
			const presets = new Set(['foo', 'bar']);
			expect(isPresetValue(presets, 'baz')).toBe(false);
			expect(isPresetValue(presets, 'qux')).toBe(false);
		});

		test('空の Set は常に false を返す', () => {
			const presets = new Set<string>();
			expect(isPresetValue(presets, 'foo')).toBe(false);
		});

		test('数値は文字列化して判定される', () => {
			const presets = new Set(['1', '2', '3']);
			expect(isPresetValue(presets, 1)).toBe(true);
			expect(isPresetValue(presets, 2)).toBe(true);
			expect(isPresetValue(presets, 4)).toBe(false);
		});

		test('数値の 0 も正しく判定される', () => {
			const presets = new Set(['0']);
			expect(isPresetValue(presets, 0)).toBe(true);
		});

		test('負の数値も正しく判定される', () => {
			const presets = new Set(['-1', '-2']);
			expect(isPresetValue(presets, -1)).toBe(true);
			expect(isPresetValue(presets, -2)).toBe(true);
		});
	});

	describe('Array を使用した場合', () => {
		test('配列に含まれる値は true を返す', () => {
			const presets = ['foo', 'bar', 'baz'];
			expect(isPresetValue(presets, 'foo')).toBe(true);
			expect(isPresetValue(presets, 'bar')).toBe(true);
			expect(isPresetValue(presets, 'baz')).toBe(true);
		});

		test('配列に含まれない値は false を返す', () => {
			const presets = ['foo', 'bar'];
			expect(isPresetValue(presets, 'baz')).toBe(false);
			expect(isPresetValue(presets, 'qux')).toBe(false);
		});

		test('空配列は常に false を返す', () => {
			const presets: string[] = [];
			expect(isPresetValue(presets, 'foo')).toBe(false);
		});

		test('数値は文字列化して判定される', () => {
			const presets = ['1', '2', '3'];
			expect(isPresetValue(presets, 1)).toBe(true);
			expect(isPresetValue(presets, 2)).toBe(true);
			expect(isPresetValue(presets, 4)).toBe(false);
		});

		test('数値の 0 も正しく判定される', () => {
			const presets = ['0'];
			expect(isPresetValue(presets, 0)).toBe(true);
		});

		test('負の数値も正しく判定される', () => {
			const presets = ['-1', '-2'];
			expect(isPresetValue(presets, -1)).toBe(true);
			expect(isPresetValue(presets, -2)).toBe(true);
		});
	});

	describe('Set と Array で同じ結果を返す', () => {
		test('同じ値のリストで同じ結果になる', () => {
			const values = ['foo', 'bar', 'baz'];
			const setPresets = new Set(values);
			const arrayPresets = values;

			expect(isPresetValue(setPresets, 'foo')).toBe(isPresetValue(arrayPresets, 'foo'));
			expect(isPresetValue(setPresets, 'bar')).toBe(isPresetValue(arrayPresets, 'bar'));
			expect(isPresetValue(setPresets, 'qux')).toBe(isPresetValue(arrayPresets, 'qux'));
		});
	});

	describe('エッジケース', () => {
		test('空文字列の判定', () => {
			const presets = new Set(['', 'foo']);
			expect(isPresetValue(presets, '')).toBe(true);
		});

		test('特殊文字を含む文字列', () => {
			const presets = new Set(['foo-bar', 'baz_qux', 'test:hover']);
			expect(isPresetValue(presets, 'foo-bar')).toBe(true);
			expect(isPresetValue(presets, 'baz_qux')).toBe(true);
			expect(isPresetValue(presets, 'test:hover')).toBe(true);
		});

		test('スペースを含む文字列', () => {
			const presets = new Set(['foo bar']);
			expect(isPresetValue(presets, 'foo bar')).toBe(true);
			expect(isPresetValue(presets, 'foo')).toBe(false);
		});

		test('大文字小文字は区別される', () => {
			const presets = new Set(['foo', 'Bar']);
			expect(isPresetValue(presets, 'foo')).toBe(true);
			expect(isPresetValue(presets, 'Foo')).toBe(false);
			expect(isPresetValue(presets, 'Bar')).toBe(true);
			expect(isPresetValue(presets, 'bar')).toBe(false);
		});

		test('浮動小数点数も文字列化される', () => {
			const presets = new Set(['1.5', '2.7']);
			expect(isPresetValue(presets, 1.5)).toBe(true);
			expect(isPresetValue(presets, 2.7)).toBe(true);
		});
	});
});
