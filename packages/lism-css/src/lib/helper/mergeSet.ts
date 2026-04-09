/**
 * base / set / unset を合成し、最終的な set 値の配列を返す。
 * unset に含まれる値は base + set から除外される。
 */

function normalizeSet(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeSet(item));
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

export default function mergeSet(base: unknown, set: unknown, unset: unknown): string[] {
  const merged = [...new Set([...normalizeSet(base), ...normalizeSet(set)])];
  if (merged.length === 0) return [];

  const unsetValues = normalizeSet(unset);
  if (unsetValues.length === 0) return merged;

  const exclude = new Set(unsetValues);
  return merged.filter((v) => !exclude.has(v));
}
