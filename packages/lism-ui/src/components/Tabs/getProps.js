import atts from 'lism-css/lib/helper/atts';

export default function getTabsProps({ lismClass, ...props }) {
	return {
		lismClass: atts(lismClass, 'd--tabs'),
		...props,
	};
}
