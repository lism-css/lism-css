import { TOKENS } from '../../config/index';

export default function isTokenValue(tokenKey: string, value: unknown): boolean {
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
    return Object.hasOwn(tokenValues, stringValue);
  }
  return false;
}
