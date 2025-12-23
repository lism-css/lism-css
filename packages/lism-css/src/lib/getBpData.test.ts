import { describe, test, expect } from 'vitest';
import getBpData from './getBpData.js';

describe('getBpData', () => {
	describe('真偽値の処理', () => {
		test('trueを渡すと { base: true } を返す', () => {
			expect(getBpData(true)).toEqual({ base: true });
		});

		test('falseを渡すと空オブジェクトを返す', () => {
			expect(getBpData(false)).toEqual({});
		});
	});

	describe('文字列・数値の処理', () => {
		test('文字列を渡すと { base: 文字列 } を返す', () => {
			expect(getBpData('center')).toEqual({ base: 'center' });
			expect(getBpData('flex')).toEqual({ base: 'flex' });
		});

		test('数値を渡すと { base: 数値 } を返す', () => {
			expect(getBpData(10)).toEqual({ base: 10 });
			expect(getBpData(0)).toEqual({ base: 0 });
			expect(getBpData(-5)).toEqual({ base: -5 });
		});
	});

	describe('配列の処理', () => {
		test('配列を渡すと各要素がブレークポイントに対応する', () => {
			expect(getBpData(['left', 'center'])).toEqual({
				base: 'left',
				sm: 'center',
			});
		});

		test('3要素の配列を渡すと base, sm, md に対応する', () => {
			expect(getBpData(['flex', 'grid', 'block'])).toEqual({
				base: 'flex',
				sm: 'grid',
				md: 'block',
			});
		});

		test('空配列を渡すと空オブジェクトを返す', () => {
			expect(getBpData([])).toEqual({});
		});

		test('配列に undefined が含まれる場合、filterEmptyObj により除外される', () => {
			expect(getBpData(['left', undefined, 'right'])).toEqual({
				base: 'left',
				md: 'right',
			});
		});

		test('配列に null が含まれる場合、filterEmptyObj により除外される', () => {
			expect(getBpData(['left', null, 'right'])).toEqual({
				base: 'left',
				md: 'right',
			});
		});

		test('配列に空文字列が含まれる場合、filterEmptyObj により除外される', () => {
			expect(getBpData(['left', '', 'right'])).toEqual({
				base: 'left',
				md: 'right',
			});
		});
	});

	describe('オブジェクトの処理 - ブレークポイント指定', () => {
		test('ブレークポイントキー（base, sm, md など）を持つオブジェクトはそのまま返す', () => {
			const bpObj = { base: 'left', sm: 'center', md: 'right' };
			expect(getBpData(bpObj)).toEqual(bpObj);
		});

		test('baseキーのみを持つオブジェクトはそのまま返す', () => {
			expect(getBpData({ base: 'center' })).toEqual({ base: 'center' });
		});

		test('smキーのみを持つオブジェクトはそのまま返す', () => {
			expect(getBpData({ sm: 'flex' })).toEqual({ sm: 'flex' });
		});

		test('mdキーのみを持つオブジェクトはそのまま返す', () => {
			expect(getBpData({ md: 'grid' })).toEqual({ md: 'grid' });
		});

		test('複数のブレークポイントキーを持つオブジェクトはそのまま返す', () => {
			const bpObj = { sm: 'start', lg: 'end' };
			expect(getBpData(bpObj)).toEqual(bpObj);
		});

		test('ブレークポイントキーに undefined が含まれる場合、filterEmptyObj により除外される', () => {
			expect(getBpData({ base: 'left', sm: undefined, md: 'right' })).toEqual({
				base: 'left',
				md: 'right',
			});
		});

		test('ブレークポイントキーに null が含まれる場合、filterEmptyObj により除外される', () => {
			expect(getBpData({ base: 'left', sm: null, md: 'right' })).toEqual({
				base: 'left',
				md: 'right',
			});
		});

		test('ブレークポイントキーに空文字列が含まれる場合、filterEmptyObj により除外される', () => {
			expect(getBpData({ base: 'left', sm: '', md: 'right' })).toEqual({
				base: 'left',
				md: 'right',
			});
		});
	});

	describe('オブジェクトの処理 - 方向オブジェクト（sides props）', () => {
		test('ブレークポイントキーを持たないオブジェクトは { base: オブジェクト } として返す', () => {
			const sidesObj = { top: '10px', bottom: '20px' };
			expect(getBpData(sidesObj)).toEqual({ base: sidesObj });
		});

		test('方向キー（top, bottom, left, right）を持つオブジェクトは { base: オブジェクト } として返す', () => {
			const sidesObj = { top: 1, right: 2, bottom: 3, left: 4 };
			expect(getBpData(sidesObj)).toEqual({ base: sidesObj });
		});

		test('任意のキーを持つオブジェクトは { base: オブジェクト } として返す', () => {
			const customObj = { x: 10, y: 20 };
			expect(getBpData(customObj)).toEqual({ base: customObj });
		});

		test('空のオブジェクトを渡すと空オブジェクトを返す（filterEmptyObjにより）', () => {
			expect(getBpData({})).toEqual({});
		});
	});

	describe('エッジケース', () => {
		test('undefinedを渡すと空オブジェクトを返す', () => {
			expect(getBpData(undefined)).toEqual({});
		});

		test('nullを渡すと空オブジェクトを返す', () => {
			expect(getBpData(null)).toEqual({});
		});

		test('0（数値のゼロ）を渡すと { base: 0 } を返す', () => {
			expect(getBpData(0)).toEqual({ base: 0 });
		});

		test('空文字列を渡すと空オブジェクトを返す（filterEmptyObjにより）', () => {
			expect(getBpData('')).toEqual({});
		});

		test('ネストしたオブジェクトを渡すと { base: ネストしたオブジェクト } を返す', () => {
			const nested = { outer: { inner: 'value' } };
			expect(getBpData(nested)).toEqual({ base: nested });
		});
	});

	describe('実際のユースケース', () => {
		test('レスポンシブな配置指定（配列形式）', () => {
			expect(getBpData(['start', 'center', 'end'])).toEqual({
				base: 'start',
				sm: 'center',
				md: 'end',
			});
		});

		test('レスポンシブな配置指定（オブジェクト形式）', () => {
			expect(getBpData({ base: 'column', md: 'row' })).toEqual({
				base: 'column',
				md: 'row',
			});
		});

		test('パディング値（方向オブジェクト）', () => {
			const padding = { top: '1rem', bottom: '2rem' };
			expect(getBpData(padding)).toEqual({ base: padding });
		});

		test('単純な文字列値', () => {
			expect(getBpData('flex')).toEqual({ base: 'flex' });
		});

		test('数値による指定', () => {
			expect(getBpData(4)).toEqual({ base: 4 });
		});

		test('ブレークポイント指定とプリミティブ値の混在', () => {
			expect(getBpData({ base: 10, sm: 20, md: 30 })).toEqual({
				base: 10,
				sm: 20,
				md: 30,
			});
		});
	});

	describe('元のデータが変更されないことを確認', () => {
		test('配列を渡しても元の配列は変更されない', () => {
			const original = ['left', 'center', 'right'];
			const originalCopy = [...original];
			getBpData(original);
			expect(original).toEqual(originalCopy);
		});

		test('オブジェクトを渡しても元のオブジェクトは変更されない', () => {
			const original = { base: 'flex', sm: 'grid' };
			const originalCopy = { ...original };
			getBpData(original);
			expect(original).toEqual(originalCopy);
		});

		test('方向オブジェクトを渡しても元のオブジェクトは変更されない', () => {
			const original = { top: 1, bottom: 2 };
			const originalCopy = { ...original };
			const result = getBpData(original);
			expect(original).toEqual(originalCopy);
			expect(result.base).toEqual(original);
			// 参照が同じことを確認（コピーされていない）
			expect(result.base).toBe(original);
		});
	});
});

