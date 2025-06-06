import atts from '../../lib/helper/atts';

import getTransformProps from '../getTransformProps';
import getInsetProps from '../getInsetProps';
import getFilterProps from '../getFilterProps';
import { getGridItemProps } from '../Grid/getProps';

export default function ({ lismClass, size, ...props }) {
	props = getGridItemProps(getFilterProps(getTransformProps(getInsetProps(props))));

	if (size) {
		props.ar = '1/1';
		props.w = size;
		// style['--size'] = size;
		// props.lismState = ['has--size'];
	}
	// props.style = style;

	const defaultProps = {
		lismClass: atts(lismClass, `l--decorator`),
		skipState: true,
		'aria-hidden': 'true',
	};

	return Object.assign(defaultProps, props);
}
