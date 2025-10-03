import atts from '../../lib/helper/atts';

export function getDividerProps({ lismClass, ...props }) {
	const defaultProps = {
		lismClass: atts(lismClass, 'l--divider'),
		'aria-hidden': 'true',
	};
	return { ...defaultProps, ...props };
}
