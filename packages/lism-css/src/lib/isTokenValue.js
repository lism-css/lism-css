import { TOKENS } from '../config';

export default function isTokenValue(key, value) {
	if (typeof key !== 'string') return false;

	const tokenValues = TOKENS[key];

	if (!Array.isArray(tokenValues)) return false;

	// 数値の時は文字列化してから判定
	if (typeof value === 'number') {
		return tokenValues.includes(`${value}`);
	}
	return tokenValues.includes(value);
}
