import atts from 'lism-css/lib/helper/atts';

export function getDividerProps({ lismClass, ...props }) {
	const defaultProps = {
		lismClass: atts(lismClass, 'a--divider'),
		'aria-hidden': 'true',
	};
	return { ...defaultProps, ...props };
}
