/** Objectの各値へ関数を適用した新しいオブジェクトを返す。 */
export default function objMap<T extends Record<string, unknown>, U>(obj: T, callback: (value: T[keyof T]) => U): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    result[key] = callback(obj[key]);
  });
  return result;
}
