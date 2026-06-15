import getTokenVarName, { type TokensConfig } from './getTokenVarName';

type TokenValue = string | number;

/**
 * tokenKey のカタログに stringValue が登録されていれば `var(...)` を、無ければ null を返す。
 * 変数名の導出は getTokenVarName に集約し、ここは membership 判定だけを担う。
 *
 * カタログ表現は Set / 配列 / 値付きフラットマップ（{ key: value }）のいずれにも対応する。
 */
function resolveTokenVar(tokenKey: string, stringValue: string, TOKENS: TokensConfig): string | null {
  const tokenValues = TOKENS[tokenKey];
  if (!tokenValues) return null;

  let isMember = false;
  if (tokenValues instanceof Set) {
    isMember = tokenValues.has(stringValue);
  } else if (Array.isArray(tokenValues)) {
    isMember = tokenValues.includes(stringValue);
  } else if (typeof tokenValues === 'object') {
    // 値付きフラットマップ（{ key: value }）はキーの有無で判定する。
    isMember = Object.hasOwn(tokenValues, stringValue);
  }

  return isMember ? `var(${getTokenVarName(tokenKey, stringValue)})` : null;
}

/**
 * Note: コンポーネント使用時だけでなく、CSSビルド時にも呼び出される。そのため、TOKENSを引数で受け取る必要がある。
 */
export default function getMaybeTokenValue(tokenKey: string, value: TokenValue, TOKENS: TokensConfig): string {
  // 数値の時は文字列化してから判定
  const stringValue = typeof value === 'number' ? `${value}` : value;

  // color は意味的カラー（color）→ 生カラー（palette）の順に解決する。
  // build 時は color / palette が別カタログ、runtime は color へ統合済みだが、
  // どちらでも同じ結果になるよう palette フォールバックを残す。
  if (tokenKey === 'color') {
    return resolveTokenVar('color', stringValue, TOKENS) ?? resolveTokenVar('palette', stringValue, TOKENS) ?? String(value);
  }

  return resolveTokenVar(tokenKey, stringValue, TOKENS) ?? String(value);
}
