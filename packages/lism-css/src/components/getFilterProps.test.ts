import { describe, test, expect } from 'vitest';
import getFilterProps from './getFilterProps';

describe('getFilterProps', () => {
	describe('基本的なfilter処理', () => {
		test('blur を filter に変換する', () => {
			const props = { blur: '5px' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('blur(5px)');
			expect(result.blur).toBeUndefined();
		});

		test('contrast を filter に変換する', () => {
			const props = { contrast: '1.2' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('contrast(1.2)');
			expect(result.contrast).toBeUndefined();
		});

		test('brightness を filter に変換する', () => {
			const props = { brightness: '1.5' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('brightness(1.5)');
			expect(result.brightness).toBeUndefined();
		});

		test('dropShadow を drop-shadow に変換する', () => {
			const props = { dropShadow: '0 0 10px rgba(0,0,0,0.5)' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('drop-shadow(0 0 10px rgba(0,0,0,0.5))');
			expect(result.dropShadow).toBeUndefined();
		});

		test('grayscale を filter に変換する', () => {
			const props = { grayscale: '1' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('grayscale(1)');
			expect(result.grayscale).toBeUndefined();
		});

		test('hueRotate を hue-rotate に変換する', () => {
			const props = { hueRotate: '90deg' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('hue-rotate(90deg)');
			expect(result.hueRotate).toBeUndefined();
		});

		test('invert を filter に変換する', () => {
			const props = { invert: '1' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('invert(1)');
			expect(result.invert).toBeUndefined();
		});

		test('saturate を filter に変換する', () => {
			const props = { saturate: '2' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('saturate(2)');
			expect(result.saturate).toBeUndefined();
		});

		test('sepia を filter に変換する', () => {
			const props = { sepia: '1' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('sepia(1)');
			expect(result.sepia).toBeUndefined();
		});
	});

	describe('複数のfilterを組み合わせる', () => {
		test('複数のfilterを結合する', () => {
			const props = {
				blur: '5px',
				contrast: '1.2',
				brightness: '1.5',
			};
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('blur(5px) contrast(1.2) brightness(1.5)');
			expect(result.blur).toBeUndefined();
			expect(result.contrast).toBeUndefined();
			expect(result.brightness).toBeUndefined();
		});

		test('すべてのfilterを結合する', () => {
			const props = {
				blur: '5px',
				contrast: '1.2',
				brightness: '1.5',
				dropShadow: '0 0 10px red',
				grayscale: '0.5',
				hueRotate: '90deg',
				invert: '0.5',
				saturate: '2',
				sepia: '0.5',
			};
			const result = getFilterProps(props);
			expect(result.style.filter).toBe(
				'blur(5px) contrast(1.2) brightness(1.5) drop-shadow(0 0 10px red) grayscale(0.5) hue-rotate(90deg) invert(0.5) saturate(2) sepia(0.5)'
			);
		});
	});

	describe('既存の style を保持する', () => {
		test('既存の style とマージする', () => {
			const props = {
				blur: '5px',
				style: { color: 'red', padding: '10px' },
			};
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('blur(5px)');
			expect(result.style.color).toBe('red');
			expect(result.style.padding).toBe('10px');
		});

		test('style が空の場合でも動作する', () => {
			const props = {
				blur: '5px',
				style: {},
			};
			const result = getFilterProps(props);
			expect(result.style.filter).toBe('blur(5px)');
		});
	});

	describe('その他のpropsを保持する', () => {
		test('filter以外のpropsは保持される', () => {
			const props = {
				blur: '5px',
				className: 'test-class',
				id: 'test-id',
				onClick: () => {},
			};
			const result = getFilterProps(props);
			expect(result.className).toBe('test-class');
			expect(result.id).toBe('test-id');
			expect(result.onClick).toBeDefined();
		});
	});

	describe('filterType パラメータ', () => {
		test('filterType に backdropFilter を指定できる', () => {
			const props = { blur: '5px' };
			const result = getFilterProps(props, 'backdropFilter');
			expect(result.style.backdropFilter).toBe('blur(5px)');
			expect(result.style.filter).toBeUndefined();
		});

		test('複数のfilterを backdropFilter として結合する', () => {
			const props = {
				blur: '5px',
				contrast: '1.2',
			};
			const result = getFilterProps(props, 'backdropFilter');
			expect(result.style.backdropFilter).toBe('blur(5px) contrast(1.2)');
		});
	});

	describe('エッジケース', () => {
		test('filterプロパティがない場合', () => {
			const props = { className: 'test' };
			const result = getFilterProps(props);
			expect(result.style.filter).toBeUndefined();
			expect(result.className).toBe('test');
		});

		test('空のpropsの場合', () => {
			const props = {};
			const result = getFilterProps(props);
			expect(result.style).toEqual({});
		});

		test('style のみの場合', () => {
			const props = { style: { color: 'red' } };
			const result = getFilterProps(props);
			expect(result.style).toEqual({ color: 'red' });
		});
	});
});
