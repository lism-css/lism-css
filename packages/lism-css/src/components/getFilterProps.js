const FILTERS = ['blur', 'contrast', 'brightness', 'dropShadow', 'grayscale', 'hueRotate', 'invert', 'saturate', 'sepia'];

export default function getFilterProps(props, filterType = 'filter') {
	const filterValues = [];

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
		style[filterType] = filterValues.join(' ');
	}

	rest.style = style;
	return rest;
}
