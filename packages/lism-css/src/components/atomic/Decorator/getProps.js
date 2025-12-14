import atts from '../../../lib/helper/atts';
import getFilterProps from '../../getFilterProps';
import setMaybeTransformStyles from '../../setMaybeTransformStyles';

// translate → rotate → scale
export default function ({ lismClass, size, clipPath, boxSizing, style = {}, ...props }) {
	props = getFilterProps(setMaybeTransformStyles(props));

	if (clipPath) {
		style.clipPath = clipPath;
	}
	if (boxSizing) {
		style.boxSizing = boxSizing;
	}

	if (size) {
		props.ar = '1/1';
		props.w = size;
		// style['--size'] = size;
	}

	props.style = style;

	const defaultProps = {
		lismClass: atts(lismClass, `a--decorator`),
		'aria-hidden': 'true',
	};

	return Object.assign(defaultProps, props);
}
