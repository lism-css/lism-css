import type { CSSProperties } from 'react';

// フィルター名の型
type FilterName = 'blur' | 'contrast' | 'brightness' | 'dropShadow' | 'grayscale' | 'hueRotate' | 'invert' | 'saturate' | 'sepia';

const FILTERS: readonly FilterName[] = ['blur', 'contrast', 'brightness', 'dropShadow', 'grayscale', 'hueRotate', 'invert', 'saturate', 'sepia'] as const;

// フィルタープロップスの型
type FilterProps = {
	[K in FilterName]?: string | number;
};

// 入力プロップスの型
interface InputProps extends FilterProps {
	style?: CSSProperties;
	[key: string]: unknown;
}

// 戻り値の型（style は常に存在する）
export interface OutputProps {
	style: CSSProperties;
	[key: string]: unknown;
}

export default function getFilterProps(props: InputProps, filterType: string = 'filter'): OutputProps {
	const filterValues: string[] = [];

	const { style = {}, ...rest } = props;

	FILTERS.forEach((filterName) => {
		if (rest[filterName]) {
			// filterName を filter-name に変換（キャメルケースをケバブケースに変換）
			const filterNameKebab = filterName.replace(/([A-Z])/g, '-$1').toLowerCase();
			filterValues.push(`${filterNameKebab}(${rest[filterName]})`);
			delete rest[filterName];
		}
	});

	// filter生成があれば style にセット
	if (filterValues.length > 0) {
		style[filterType as keyof CSSProperties] = filterValues.join(' ') as never;
	}

	return {
		...rest,
		style,
	};
}
