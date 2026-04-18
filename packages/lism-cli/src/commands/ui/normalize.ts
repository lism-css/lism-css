/**
 * コンポーネント名を比較用の正規形（ハイフン・アンダースコア除去 + 小文字化）に変換する。
 * `nav-menu` / `nav_menu` / `navMenu` / `NavMenu` / `navmenu` をすべて `navmenu` に揃える。
 */
export const normalizeComponentName = (s: string): string => s.replace(/[-_]/g, '').toLowerCase();
