import atts from '../../lib/helper/atts';
import getFilterProps from '../getFilterProps';

export default function ({ lismClass, size, clipPath, style = {}, ...props }) {
	props = getFilterProps(props);

	if (clipPath) {
		style.clipPath = clipPath;
	}

	if (size) {
		props.ar = '1/1';
		props.w = size;
		// style['--size'] = size;
		// props.lismState = ['has--size'];
	}

	props.style = style;

	const defaultProps = {
		lismClass: atts(lismClass, `l--decorator`),
		skipState: true,
		'aria-hidden': 'true',
	};

	return Object.assign(defaultProps, props);
}
