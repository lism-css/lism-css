type TokenConfigValues = Set<string> | string[] | readonly string[];
interface TokenConfigValuesObj {
  pre?: string;
  values?: TokenConfigValues;
}
type TokenConfigProp = TokenConfigValues | TokenConfigValuesObj;
export type TokensConfig = Record<string, TokenConfigProp>;

/**
 * トークンキー + 値キーから、対応する CSS カスタムプロパティ名を導出する。
 *
 * トークン値の「変数名の導出」を1か所に集約するための関数。
 * getMaybeTokenValue（コンポーネント / utility 解決）と serializeTokenValues（#431 の値出力）が共有し、
 * `lts="2xl"` の解決名と `:root` に出力する変数名を必ず一致させる。
 *
 * - 配列 / Set 形式のトークン（lts/fz 等）: `--{tokenKey}--{key}`（例: lts, 2xl → --lts--2xl）
 * - オブジェクト形式のトークン（space/c/palette の { pre, values }）: `{pre}{key}`（例: space(pre:--s), 90 → --s90 / c(pre:--), success → --success）
 * - 未登録トークン: 配列形式と同じ `--{tokenKey}--{key}` を既定とする。
 */
export default function getTokenVarName(tokenKey: string, key: string, TOKENS: TokensConfig): string {
  const token = TOKENS[tokenKey];

  // オブジェクト形式（{ pre, values }）は pre を尊重した変数名にする。
  if (token && typeof token === 'object' && !Array.isArray(token) && !(token instanceof Set) && ('pre' in token || 'values' in token)) {
    const { pre = '' } = token as TokenConfigValuesObj;
    return `${pre}${key}`;
  }

  return `--${tokenKey}--${key}`;
}
