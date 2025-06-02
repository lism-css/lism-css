import atts from '../../lib/helper/atts';
// import getMaybeCssVar from '../../lib/getMaybeCssVar';

export default function getTabsProps({
	lismClass,
	// variant = 'default',
	// isHorizontal,
	// keepHeight,
	// listProps = {},
	...props
}) {
	return {
		lismClass: atts(lismClass, 'd--tabs'),
		...props,
	};
}
