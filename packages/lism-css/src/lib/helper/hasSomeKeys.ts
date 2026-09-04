/**
 * object が keys のいずれかをキーとして持っているか。
 */
export default function hasSomeKeys(object: object, keys: readonly (string | number)[] | (string | number)[]) {
  if (null == object) return false;
  return keys.some((key) => Object.prototype.hasOwnProperty.call(object, key));
}
