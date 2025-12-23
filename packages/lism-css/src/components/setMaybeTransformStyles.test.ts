import { describe, test, expect } from 'vitest';
import setMaybeTransformStyles from './setMaybeTransformStyles';

describe('setMaybeTransformStyles', () => {
	describe('基本的なtransform処理', () => {
		test('translate を style に追加する', () => {
			const props = { translate: '10px 20px' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
			expect(result.translate).toBeUndefined();
		});

		test('rotate を style に追加する', () => {
			const props = { rotate: '45deg' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.rotate).toBe('45deg');
			expect(result.rotate).toBeUndefined();
		});

		test('scale を style に追加する', () => {
			const props = { scale: '1.5' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.scale).toBe('1.5');
			expect(result.scale).toBeUndefined();
		});

		test('transform を style に追加する', () => {
			const props = { transform: 'skew(10deg)' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.transform).toBe('skew(10deg)');
			expect(result.transform).toBeUndefined();
		});
	});

	describe('複数のtransformを組み合わせる', () => {
		test('translate と rotate を同時に設定する', () => {
			const props = {
				translate: '10px 20px',
				rotate: '45deg',
			};
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
			expect(result.style.rotate).toBe('45deg');
			expect(result.translate).toBeUndefined();
			expect(result.rotate).toBeUndefined();
		});

		test('translate, rotate, scale を同時に設定する', () => {
			const props = {
				translate: '10px 20px',
				rotate: '45deg',
				scale: '1.5',
			};
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
			expect(result.style.rotate).toBe('45deg');
			expect(result.style.scale).toBe('1.5');
		});

		test('すべてのプロパティを同時に設定する', () => {
			const props = {
				translate: '10px 20px',
				rotate: '45deg',
				scale: '1.5',
				transform: 'skew(10deg)',
			};
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
			expect(result.style.rotate).toBe('45deg');
			expect(result.style.scale).toBe('1.5');
			expect(result.style.transform).toBe('skew(10deg)');
		});
	});

	describe('既存の style を保持する', () => {
		test('既存の style とマージする', () => {
			const props = {
				translate: '10px 20px',
				style: { color: 'red', padding: '10px' },
			};
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
			expect(result.style.color).toBe('red');
			expect(result.style.padding).toBe('10px');
		});

		test('style が空の場合でも動作する', () => {
			const props = {
				translate: '10px 20px',
				style: {},
			};
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
		});

		test('既存の style に transform 系のプロパティがある場合は上書きされる', () => {
			const props = {
				translate: '10px 20px',
				style: { translate: '5px 5px' },
			};
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px');
		});
	});

	describe('その他のpropsを保持する', () => {
		test('transform以外のpropsは保持される', () => {
			const props = {
				translate: '10px 20px',
				className: 'test-class',
				id: 'test-id',
				onClick: () => {},
			};
			const result = setMaybeTransformStyles(props);
			expect(result.className).toBe('test-class');
			expect(result.id).toBe('test-id');
			expect(result.onClick).toBeDefined();
		});
	});

	describe('エッジケース', () => {
		test('transformプロパティがない場合', () => {
			const props = { className: 'test' };
			const result = setMaybeTransformStyles(props);
			expect(result.style).toEqual({});
			expect(result.className).toBe('test');
		});

		test('空のpropsの場合', () => {
			const props = {};
			const result = setMaybeTransformStyles(props);
			expect(result.style).toEqual({});
		});

		test('style のみの場合', () => {
			const props = { style: { color: 'red' } };
			const result = setMaybeTransformStyles(props);
			expect(result.style).toEqual({ color: 'red' });
		});

		test('translate に 0 を指定した場合は設定されない（falsyな値）', () => {
			const props = { translate: 0 };
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBeUndefined();
		});

		test('複数の値を持つ translate', () => {
			const props = { translate: '10px 20px 30px' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.translate).toBe('10px 20px 30px');
		});

		test('scale に単一の値を指定', () => {
			const props = { scale: '2' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.scale).toBe('2');
		});

		test('scale に複数の値を指定', () => {
			const props = { scale: '2 1.5' };
			const result = setMaybeTransformStyles(props);
			expect(result.style.scale).toBe('2 1.5');
		});
	});
});
