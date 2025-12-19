/**
 * object が keys のいずれかをキーとして持っているか。
 *
 * @param {Object} object
 * @param {Array} keys
 * @returns {boolean}
 */
export default function hasSomeKeys(object, keys) {
	if (null == object) return false;
	return keys.some((key) => Object.prototype.hasOwnProperty.call(object, key));
}
