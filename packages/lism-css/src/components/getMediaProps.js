import getFilterProps from './getFilterProps';
import atts from '../lib/helper/atts';

export default function getMediaProps({
	className = '',
	objectFit,
	objectPosition,
	style = {},
	...props
}) {
	if (objectFit) {
		if (objectFit === 'cover' || objectFit === 'cv') {
			className = atts(className, '-obf:cv');
		} else if (objectFit === 'contain' || objectFit === 'cn') {
			className = atts(className, '-obf:cn');
		} else {
			style.objectFit = objectFit;
		}
	}
	if (objectPosition) {
		style.objectPosition = objectPosition;
	}

	props.className = className;
	props.style = style;

	return getFilterProps(props);
}
