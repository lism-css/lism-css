/** value（string / number）が collection（Set / 配列 / オブジェクトのキー）に含まれるかを判定する。 */
export default function isMemberOf(collection: unknown, value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const key = `${value}`;

  if (collection instanceof Set) return collection.has(key);
  if (Array.isArray(collection)) return collection.includes(key);
  if (typeof collection === 'object' && collection !== null) return Object.hasOwn(collection, key);
  return false;
}
