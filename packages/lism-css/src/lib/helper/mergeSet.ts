/**
 * set と unset を合成し、最終的な set 値の配列を返す。
 * unset に含まれる値は set から除外される。
 */

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export default function mergeSet(set: unknown, unset: unknown): string[] {
  const setValues = toArray(set);
  if (setValues.length === 0) return [];

  const unsetValues = toArray(unset);
  if (unsetValues.length === 0) return setValues;

  const exclude = new Set(unsetValues);
  return setValues.filter((v) => !exclude.has(v));
}
