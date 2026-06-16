/**
 * スコープ上書きを伴うトークンの「再宣言セレクタ」
 *
 * 構造変数を上書きできるクラスを持つトークン（.set--s で単位を em 化 / .set--bxsh で影色を差し替え等）
 */
export const TOKEN_SCOPE = {
  space: 'set--s',
  bxsh: 'set--bxsh',
} as const;
