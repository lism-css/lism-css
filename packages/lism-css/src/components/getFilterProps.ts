import type { LismProps } from '../lib/getLismProps';
import type { StyleWithCustomProps } from '../lib/types';

// フィルター名の型
type FilterName = 'blur' | 'contrast' | 'brightness' | 'dropShadow' | 'grayscale' | 'hueRotate' | 'invert' | 'saturate' | 'sepia';

const FILTERS: readonly FilterName[] = [
	'blur',
	'contrast',
	'brightness',
	'dropShadow',
	'grayscale',
	'hueRotate',
	'invert',
	'saturate',
	'sepia',
] as const;

// フィルタープロップスの型
export type FilterProps = {
	[K in FilterName]?: string | number;
};

export default function getFilterProps(props: LismProps & FilterProps, filterType: string = 'filter'): LismProps & { style: StyleWithCustomProps } {
	const filterValues: string[] = [];

	const { style = {}, ...rest } = props;

	FILTERS.forEach((filterName) => {
		if (rest[filterName]) {
			// filterName を filter-name に変換（キャメルケースをケバブケースに変換）
			const filterNameKebab = filterName.replace(/([A-Z])/g, '-$1').toLowerCase();
			filterValues.push(`${filterNameKebab}(${rest[filterName]})`);
			delete (rest as FilterProps)[filterName];
		}
	});

	// filter生成があれば style にセット
	if (filterValues.length > 0) {
		(style as Record<string, string>)[filterType] = filterValues.join(' ');
	}

	return { ...rest, style };
}
