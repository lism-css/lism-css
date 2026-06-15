import { TOKENS } from '../../config/index';

export default function isTokenValue(tokenKey: string, value: unknown): boolean {
  // 数値の時は文字列化してから判定
  let stringValue: string;
  if (typeof value === 'number') {
    stringValue = `${value}`;
  } else if (typeof value === 'string') {
    stringValue = value;
  } else {
    return false;
  }

  // tokenKey が TOKENS に存在するかチェック
  if (!(tokenKey in TOKENS)) return false;

  const tokenValues = TOKENS[tokenKey as keyof typeof TOKENS];

  if (tokenValues instanceof Set) {
    return tokenValues.has(stringValue);
  } else if (Array.isArray(tokenValues)) {
    return tokenValues.includes(stringValue);
  } else if (typeof tokenValues === 'object' && tokenValues !== null) {
    // 値付きフラットマップ（{ key: value }）はキーの有無で判定する。
    return Object.hasOwn(tokenValues, stringValue);
  }
  return false;
}
