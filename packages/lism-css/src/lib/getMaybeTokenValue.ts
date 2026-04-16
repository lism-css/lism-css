type TokenValue = string | number;

type TokenConfigValues = Set<string> | string[] | readonly string[];
interface TokenConfigValuesObj {
  pre?: string;
  values?: TokenConfigValues;
}

type TokenConfigProp = TokenConfigValues | TokenConfigValuesObj;

type TokensConfig = Record<string, TokenConfigProp>;

/**
 * Note: コンポーネント使用時だけでなく、CSSビルド時にも呼び出される。そのため、TOKENSを引数で受け取る必要がある。
 */
export default function getMaybeTokenValue(tokenKey: string, value: TokenValue, TOKENS: TokensConfig): string {
  // color トークンの場合は c と palette での変換を試行
  if (tokenKey === 'color') {
    let result = getMaybeTokenValue('c', value, TOKENS);

    if (result === String(value)) {
      // まだ何も変わってなければ palette でも変換を試行
      result = getMaybeTokenValue('palette', value, TOKENS);
    }
    return result;
  }

  const tokenValues = TOKENS[tokenKey];
  if (!tokenValues) return String(value);

  // 数値の時は文字列化してから判定
  const stringValue = typeof value === 'number' ? `${value}` : value;

  if (tokenValues instanceof Set) {
    if (tokenValues.has(stringValue)) {
      return `var(--${tokenKey}--${stringValue})`;
    }
  } else if (Array.isArray(tokenValues)) {
    if (tokenValues.includes(stringValue)) {
      return `var(--${tokenKey}--${stringValue})`;
    }
  } else if ('pre' in tokenValues || 'values' in tokenValues) {
    // ここに到達した時点で tokenValues は Set でも配列でもないので、オブジェクト形式
    const { pre = '', values = [] } = tokenValues as TokenConfigValuesObj;

    if (values instanceof Set && values.has(stringValue)) {
      return `var(${pre}${stringValue})`;
    } else if (Array.isArray(values) && values.includes(stringValue)) {
      return `var(${pre}${stringValue})`;
    }
  }

  return String(value);
}
