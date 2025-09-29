import { TOKENS } from 'lism-css/config';

export default function isTokenValue(tokenKey, value) {
	if (typeof tokenKey !== 'string') return false;

	// 数値の時は文字列化してから判定
	if (typeof value === 'number') {
		value = `${value}`;
	}

	const tokenValues = TOKENS[tokenKey];
	if (tokenValues instanceof Set) {
		return tokenValues.has(value);
	} else if (Array.isArray(tokenValues)) {
		return tokenValues.includes(value);
	} else if (typeof tokenValues === 'object') {
		const values = tokenValues.values || new Set();
		return values.has(value);
	}
	return false;
}
