import { TOKENS } from '../config';

export default function isTokenValue(key, value) {
	if (typeof key !== 'string') return false;

	// 数値の時は文字列化してから判定
	if (typeof value === 'number') {
		value = `${value}`;
	}

	const tokenValues = TOKENS[key];
	if (tokenValues instanceof Set) {
		return tokenValues.has(value);
	} else if (Array.isArray(tokenValues)) {
		return tokenValues.includes(value);
	}
	return false;
}
