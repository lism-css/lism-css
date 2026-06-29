/**
 * トークンの CSS 変数名ルール（プレフィックス）
 *
 * 既定の変数名は `--{token}--{key}`（例: --fz--xs）。
 * このマップに列挙したトークンだけフラット命名 `{prefix}{key}` に切り替える。
 */
export const TOKEN_VAR_PREFIX = {
  space: '--s', // --s30
  color: '--', // --brand
  palette: '--', // --red
} as const;
