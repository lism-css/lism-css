import type { StyleWithCustomProps } from '../lib/types';

// フィルター名の型
type FilterName = 'blur' | 'contrast' | 'brightness' | 'dropShadow' | 'grayscale' | 'hueRotate' | 'invert' | 'saturate' | 'sepia';

const FILTERS: readonly FilterName[] = ['blur', 'contrast', 'brightness', 'dropShadow', 'grayscale', 'hueRotate', 'invert', 'saturate', 'sepia'] as const;

// フィルタープロップスの型
type FilterProps = {
	[K in FilterName]?: string | number;
};

// 入力プロップスの型
interface InputProps extends FilterProps {
	style?: StyleWithCustomProps;
	[key: string]: unknown;
}

// 戻り値の型（style は常に存在する）
export interface OutputProps {
	style: StyleWithCustomProps;
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
		(style as Record<string, string>)[filterType] = filterValues.join(' ');
	}

	return {
		...rest,
		style,
	};
}
