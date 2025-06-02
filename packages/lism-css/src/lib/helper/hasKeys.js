// object がに keys のいずれかをキーとして持っているか。
// objcet: objcet
// keys: array
export default function hasKeys(object, keys) {
	if (null == object) return false;
	return keys.some((key) => Object.prototype.hasOwnProperty.call(object, key));
}
