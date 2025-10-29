import atts from '../../lib/helper/atts';
// import getMaybeCssVar from '../../lib/getMaybeCssVar';

export default function getTabsProps({ lismClass, ...props }) {
	return {
		lismClass: atts(lismClass, 'd--tabs'),
		...props,
	};
}
