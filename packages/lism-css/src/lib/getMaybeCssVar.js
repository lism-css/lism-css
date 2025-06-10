import isNumStr from './helper/isNumStr';
import isTokenValue from './isTokenValue';

// 対応するCSS変数があれば返す
export default function getMaybeCssVar(value, converter, propName = '') {
	if (typeof converter === 'function') {
		return converter(value);
	} else if (typeof converter === 'string') {
		switch (converter) {
			case 'space':
				return getMaybeSpaceVar(value, propName);
			case 'color':
				return getMaybeColorVar(value, propName);
			case 'size':
				return getMaybeSizeVar(value);
			case 'bdrs':
				return getMaybeRadiusVar(value);
			case 'bxsh':
				return getMaybeShadowVar(value);
			// case 'opacity':
			// 	return getMaybeOpacityVar(value);
			case 'fz':
				return getMaybeFzVar(value);
			// case 'filter':
			// 	return getMaybeFilterVar(value);
			default:
				return value;
		}
	} else if (converter === 1) {
		if (isTokenValue(propName, value)) {
			return `var(--${propName}--${value})`;
		}
	}
	return value;
}

// console.log('Number10%', Number('10%'));
export function getMaybeSpaceVar(value, propName) {
	if (0 === value || '0' === value) return '0';

	// spaceが 整数 or 整数を示す文字列 の場合
	if (typeof value === 'number' || isNumStr(value)) {
		return `var(--s${value})`;
	}

	//
	// + があれば calcで足す?
	// ...

	// スペース区切りで一括指定されている場合
	if (typeof value === 'string' && value.includes(' ')) {
		// （calc(), var() 等 があれば対象外にしたい）
		if (!value.includes('calc(') && !value.includes('var(') && !value.includes(',')) {
			// spaceを' 'で配列化して、数値なら変数化する
			//     ex) '20 40' → '--s20 --s40', '20 10px' → '--s20 10px'
			const spaceArr = value.split(' ');
			return spaceArr.map((_s) => getMaybeSpaceVar(_s)).join(' ');
		}
	}

	// それ以外はそのまま返す
	return value;
}

export function getMaybeColorVar(value, propType) {
	// ユーティリティクラス化されない文脈で COLOR:数値% で指定されてしまった場合
	if (typeof value === 'string' && value.endsWith('%')) {
		const [color, alpha] = value.split(':');
		return `color-mix(in srgb, ${getMaybeColorVar(color)} ${alpha}, transparent)`;
	}

	// カラートークンかどうか
	if (isTokenValue('color', value)) {
		return `var(--c-${value})`;
	} else if (isTokenValue('palette', value)) {
		return `var(--${value})`;
	}

	return value;
}

export function getMaybeSizeVar(value) {
	if (isTokenValue('contentSize', value)) {
		return `var(--size-${value})`;
	}

	return value;
}

export function getMaybeRadiusVar(value) {
	if (isTokenValue('bdrs', value)) {
		return 'var(--bdrs-' + value + ')';
	}
	return value;
}

export function getMaybeShadowVar(value) {
	if (isTokenValue('bxsh', value)) {
		value = value + ''; // 数値でも渡ってくるので文字列化

		// -をiに変換
		value = value.replace('-', 'i');

		// 0 は none
		if (value === '0') return 'none';

		return 'var(--bxsh-' + value + ')';
	}

	return value;
}

export function getMaybeFzVar(value) {
	if (isTokenValue('fz', value)) {
		return 'var(--fz-' + value + ')';
	}
	return value;
}

// export function getMaybeFilterVar(filter) {
// 	if (isTokenValue('filter', filter)) {
// 		return `var(--filter-${filter})`;
// 	}

// 	return filter;
// }
