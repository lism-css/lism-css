// isEmptyObj;
import isEmptyObj from './isEmptyObj';

// 0 を残すように注意
export default function filterEmptyObj(obj) {
	for (const key in obj) {
		if (obj[key] === '' || null === obj[key] || undefined === obj[key]) {
			delete obj[key];
		} else if (typeof obj[key] === 'object' && isEmptyObj(obj[key])) {
			delete obj[key];
		}
	}
	return obj;
}
