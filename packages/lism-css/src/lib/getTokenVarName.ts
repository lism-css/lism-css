import { TOKEN_VAR_PREFIX } from '../../config/defaults/token-var-prefix';

/**
 * トークンのカタログ表現。membership 判定用に以下のいずれかを受け付ける:
 * - Set / 配列（キーの集合）
 * - 値付きフラットマップ（{ key: value }。実ランタイム / ビルドの tokens 形式）
 */
export type TokensConfig = Record<string, Set<string> | readonly string[] | string[] | Record<string, unknown>>;

/**
 * トークンキー + 値キーから、対応する CSS カスタムプロパティ名を導出する。
 *
 * トークン値の「変数名の導出」を1か所に集約するための関数。
 * getMaybeTokenValue（コンポーネント / utility 解決）と serialize（値の出力）が共有し、
 * `lts="2xl"` の解決名と `:root` に出力する変数名を必ず一致させる。
 *
 * - TOKEN_VAR_PREFIX 登録トークン: `{prefix}{key}`（例: space → --s90 / c・palette → --brand / --red）
 * - それ以外のトークン: `--{tokenKey}--{key}`（例: fz → --fz--m / lts → --lts--2xl）
 */
export default function getTokenVarName(tokenKey: string, key: string): string {
  const prefix = TOKEN_VAR_PREFIX[tokenKey as keyof typeof TOKEN_VAR_PREFIX];
  return prefix !== undefined ? `${prefix}${key}` : `--${tokenKey}--${key}`;
}
