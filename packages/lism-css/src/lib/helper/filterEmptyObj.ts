// isEmptyObj;
import isEmptyObj from './isEmptyObj';

/**
 * オブジェクトから空の値を持つプロパティを除外した新しいオブジェクトを返す（非破壊的）
 *
 * 以下の値を持つプロパティが除外されます：
 * - 空文字列 ('')
 * - null
 * - undefined
 * - 空のオブジェクト ({})
 * - 空の配列 ([])
 *
 * 注意：0、false などの falsy な値は保持されます
 *
 * @param {Object} obj - フィルタリング対象のオブジェクト
 * @returns {Object} 空の値を除外した新しいオブジェクト
 *
 * @example
 * filterEmptyObj({ a: 'foo', b: '', c: null, d: 0 })
 * // => { a: 'foo', d: 0 }
 */
export default function filterEmptyObj(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const key in obj) {
		if (obj[key] === '' || null === obj[key] || undefined === obj[key]) {
			continue;
		}
		if (typeof obj[key] === 'object' && isEmptyObj(obj[key])) {
			continue;
		}
		result[key] = obj[key];
	}
	return result;
}
