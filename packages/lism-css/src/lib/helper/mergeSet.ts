/**
 * base / value を合成し、最終的なクラス識別子の配列を返す。
 * 値内の `-` prefix は除外マーカーとして扱われ、その識別子は base + value から除外される。
 *
 * `set` / `util` のいずれの prop でも共用できる汎用処理。
 *
 * 入力は空白区切りを基本とし、カンマ区切りも互換のため受け付ける。
 * 内部 API 用途として文字列配列も受け付けるが、配列形式はユーザー向けドキュメントでは紹介していない。
 */

function normalize(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => normalize(item));
  if (typeof value !== 'string') return [];
  return value
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function mergeSet(base: unknown, value: unknown): string[] {
  const tokens = [...normalize(base), ...normalize(value)];
  if (tokens.length === 0) return [];

  const include: string[] = [];
  const exclude = new Set<string>();
  for (const token of tokens) {
    if (token.startsWith('-')) {
      exclude.add(token.slice(1));
    } else if (!include.includes(token)) {
      include.push(token);
    }
  }
  return include.filter((v) => !exclude.has(v));
}
