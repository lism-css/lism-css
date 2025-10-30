import { TOKENS } from '../../config/index.js';

export default function getMaybeTokenValue(tokenKey, value) {
	if (typeof tokenKey !== 'string') return value;

	// color トークンの場合は c と palette での変換を試行
	if (tokenKey === 'color') {
		let result = getMaybeTokenValue('c', value);

		if (result === value) {
			// まだ何も変わってなければ palette でも変換を試行
			result = getMaybeTokenValue('palette', value);
		}
		return result;
	}

	const tokenValues = TOKENS[tokenKey];
	if (!tokenValues) return value;

	// 数値の時は文字列化してから判定
	if (typeof value === 'number') {
		value = `${value}`;
	}

	if (tokenValues instanceof Set) {
		if (tokenValues.has(value)) {
			// マイナスの値を変換（-10 → n10）
			if (value.startsWith('-')) {
				value = `n${value.slice(1)}`;
			}
			return `var(--${tokenKey}--${value})`;
		}
	} else if (typeof tokenValues === 'object') {
		const { pre = '', values = new Set() } = tokenValues || {};
		if (values.has(value)) {
			return `var(${pre}${value})`;
		}
	}

	return value;
}
