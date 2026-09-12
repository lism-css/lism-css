/**
 * コンテンツファイルの相対パス（拡張子なし）を公開 URL のスラッグに変換する。
 *
 * - `primitives/` / `trait-class/` 配下のみファイル名の大文字・小文字をそのまま保持
 *   （CSS クラス名と URL を一致させるための例外）
 * - それ以外は全て小文字化（既存 URL の破壊的変更を避けるため）
 *
 * NOTE: 同じ分岐ロジックを packages/mcp/src/lib/search.ts の `sourcePathToUrlSlug` でも持っている。
 * 別ワークスペースから import できないためローカル実装となっているが、ここを変更したら必ず同期すること。
 */
const PRESERVE_CASE_PREFIXES = ['primitives/', 'trait-class/'];

export function toContentSlug(rawSlug: string): string {
  return PRESERVE_CASE_PREFIXES.some((prefix) => rawSlug.startsWith(prefix)) ? rawSlug : rawSlug.toLowerCase();
}
