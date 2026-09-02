import isEmptyObj from './isEmptyObj';

/**
 * 空の値を除外した新しいオブジェクトを返す。0とfalseは保持する。
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
