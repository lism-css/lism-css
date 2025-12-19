/**
 * object が keys のいずれかをキーとして持っているか。
 */
export default function hasSomeKeys(object: object, keys: (string | number)[]) {
	if (null == object) return false; // TODO: 型で防げるので、削除する。
	return keys.some((key) => Object.prototype.hasOwnProperty.call(object, key));
}
