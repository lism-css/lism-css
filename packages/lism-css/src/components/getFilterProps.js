const FILTERS = [
	'blur',
	'contrast',
	'brightness',
	'dropShadow',
	'grayscale',
	'hueRotate',
	'invert',
	'saturate',
	'sepia',
];

export default function getFilterProps({ css = {}, ...props }, type = 'filter') {
	const filterValues = [];

	if (null == css[type]) {
		FILTERS.forEach((filterName) => {
			if (props[filterName]) {
				// filterName を filter-name に変換（キャメルケースをケバブケースに変換）
				const filterNameKebab = filterName.replace(/([A-Z])/g, '-$1').toLowerCase();
				filterValues.push(`${filterNameKebab}(${props[filterName]})`);
				delete props[filterName];
			}
		});

		if (filterValues.length > 0) {
			css[type] = filterValues.join(' ');
		}
	}

	props.css = css;

	return props;
}
