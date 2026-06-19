// 直前が単語文字 / ハイフンでないことを要求して、`foo-bar` の `-bar` を誤マッチしないようにする。
const LISM_CLASS_RE = /(?<![A-Za-z0-9_-])(?:(?:c|a|l|is|has|set|u)--|-)[A-Za-z][\w:\-/.%]*/g;

export function extractLismClasses(text: string, into: Set<string> = new Set()): Set<string> {
  if (!text) return into;
  for (const m of text.matchAll(LISM_CLASS_RE)) {
    into.add(m[0]);
  }
  return into;
}
