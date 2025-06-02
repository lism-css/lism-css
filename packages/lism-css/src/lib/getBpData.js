import filterEmptyObj from './helper/filterEmptyObj';
import hasKeys from './helper/hasKeys';
import { BREAK_POINTS } from '../config';

const BREAK_POINTS_ALL = ['base', ...BREAK_POINTS];

// BP指定に必要な規格化した形式のオブジェクトを返す.
//     ( string, array, obj → {_, sm, md, ...} の型のobjectに変換する. )
export default function getBpData(propVal) {
	let values = {};

	if (true === propVal) return { base: true };

	if (typeof propVal === 'string' || typeof propVal === 'number') {
		values.base = propVal;
	} else if (Array.isArray(propVal)) {
		propVal.forEach((r, i) => {
			values[`${BREAK_POINTS_ALL[i]}`] = r;
		});
	} else if (typeof propVal === 'object') {
		if (hasKeys(propVal, BREAK_POINTS_ALL)) {
			// 'sm', 'md' などがある場合はｍbp指定のオブジェクトとみなす
			values = propVal;
		} else {
			values.base = propVal; // 方向ブジェクト(sides props)の場合
		}
	}

	return filterEmptyObj(values);
}
