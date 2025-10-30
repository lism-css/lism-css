/**
 * Note: コンポーネント使用時だけでなく、CSSビルド時にも呼び出される。そのため、TOKENSを引数で受け取る必要がある。
 */
export default function getMaybeTokenValue(tokenKey, value, TOKENS) {
	if (typeof tokenKey !== 'string') return value;

	// color トークンの場合は c と palette での変換を試行
	if (tokenKey === 'color') {
		let result = getMaybeTokenValue('c', value, TOKENS);

		if (result === value) {
			// まだ何も変わってなければ palette でも変換を試行
			result = getMaybeTokenValue('palette', value, TOKENS);
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
	} else if (Array.isArray(tokenValues)) {
		if (tokenValues.includes(value)) {
			// マイナスの値を変換（-10 → n10）
			if (value.startsWith('-')) {
				value = `n${value.slice(1)}`;
			}
			return `var(--${tokenKey}--${value})`;
		}
	} else if (typeof tokenValues === 'object') {
		const { pre = '', values = [] } = tokenValues || {};

		if (tokenValues instanceof Set && values.has(value)) {
			return `var(${pre}${value})`;
		} else if (Array.isArray(values) && values.includes(value)) {
			return `var(${pre}${value})`;
		}
	}

	return value;
}
