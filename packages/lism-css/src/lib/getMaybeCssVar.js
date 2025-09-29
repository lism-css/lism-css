import isNumStr from './helper/isNumStr';
import getMaybeTokenValue from './getMaybeTokenValue';

// 対応するCSS変数があれば返す
export default function getMaybeCssVar(value, tokenKey) {
	if (!tokenKey) return value;

	// if (typeof tokenKey === 'string') {
	switch (tokenKey) {
		case 'space':
			return getMaybeSpaceVar(value);
		case 'color':
			return getMaybeColorVar(value);
		case 'bxsh':
			// 0 は none
			if (value === '0' || value === 0) return 'none';
			return getMaybeTokenValue(tokenKey, value);

		default:
			return getMaybeTokenValue(tokenKey, value);
	}
}

export function getMaybeSpaceVar(value) {
	if (0 === value || '0' === value) return '0';

	// spaceが 整数 or 整数を示す文字列 の場合
	if (typeof value === 'number' || isNumStr(value)) {
		return `var(--s${value})`;
	}

	// それ以外はそのまま返す
	return value;
}

export function getMaybeColorVar(value) {
	// ユーティリティクラス化されない文脈で COLOR:数値% で指定されてしまった場合に呼び出される
	if (typeof value === 'string' && value.endsWith('%')) {
		const [color, alpha] = value.split(':');
		return `color-mix(in srgb, ${getMaybeTokenValue('color', color)} ${alpha}, transparent)`;
	}

	return getMaybeTokenValue('color', value);
}
