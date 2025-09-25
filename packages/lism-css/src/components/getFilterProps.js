const FILTERS = ['blur', 'contrast', 'brightness', 'dropShadow', 'grayscale', 'hueRotate', 'invert', 'saturate', 'sepia'];

export default function getFilterProps(props, filterType = 'filter') {
	const filterValues = [];

	const style = props.style || {};

	if (null == props[filterType]) {
		FILTERS.forEach((filterName) => {
			if (props[filterName]) {
				// filterName を filter-name に変換（キャメルケースをケバブケースに変換）
				const filterNameKebab = filterName.replace(/([A-Z])/g, '-$1').toLowerCase();
				filterValues.push(`${filterNameKebab}(${props[filterName]})`);
				delete props[filterName];
			}
		});

		if (filterValues.length > 0) {
			style[filterType] = filterValues.join(' ');
		}
	}

	return props;
}
