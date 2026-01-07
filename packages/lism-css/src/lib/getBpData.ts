import filterEmptyObj from './helper/filterEmptyObj';
import hasSomeKeys from './helper/hasSomeKeys';
import { BREAK_POINTS } from '../../config/index';

const BREAK_POINTS_ALL = ['base', ...BREAK_POINTS] as const;

type BpValue = string | number | boolean | object | null | undefined;

// BP指定に必要な規格化した形式のオブジェクトを返す.
//     ( string, array, obj → {_, sm, md, ...} の型のobjectに変換する. )
export default function getBpData(
	propVal: string | number | boolean | BpValue[] | Record<string, BpValue> | null | undefined
): Record<string, unknown> {
	let values: Record<string, BpValue> = {};

	if (true === propVal) return { base: true };

	if (typeof propVal === 'string' || typeof propVal === 'number') {
		values.base = propVal;
	} else if (Array.isArray(propVal)) {
		propVal.forEach((r, i) => {
			values[`${BREAK_POINTS_ALL[i]}`] = r;
		});
	} else if (propVal && typeof propVal === 'object') {
		if (hasSomeKeys(propVal, BREAK_POINTS_ALL)) {
			// 'sm', 'md' などがある場合はｍbp指定のオブジェクトとみなす
			values = propVal as Record<string, BpValue>;
		} else {
			values.base = propVal; // 方向ブジェクト(sides props)の場合
		}
	}

	return filterEmptyObj(values);
}
