/**
 * トークンの CSS 変数名ルール（プレフィックス）の単一情報源。
 *
 * 既定の変数名は `--{token}--{key}`（例: --fz--xs）。
 * このマップに列挙したトークンだけ、フラット命名 `{prefix}{key}` に切り替える。
 *
 * Why: 旧構造ではトークンオブジェクト内に `pre` を混在させていたが、`tokens` を純粋な
 *      「キー: 値」マップへ統一するため変数名ルールだけを外出しした。実体は prefix だけでなく
 *      「変数名ルール」なので定数名は TOKEN_VAR_PREFIX とする。
 * How: getTokenVarName() がこのマップを引いて変数名を導出する（登録外は既定形式）。
 */
export const TOKEN_VAR_PREFIX = {
  space: '--s', // --s30
  color: '--', // --brand
  palette: '--', // --red
} as const;
