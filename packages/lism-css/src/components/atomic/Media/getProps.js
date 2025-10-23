import atts from '../../../lib/helper/atts';
import getFilterProps from '../../getFilterProps';

export default function getMediaProps(props) {
	const { objectPosition, objectFit, lismClass = '', style = {}, ...rest } = props;

	if (objectPosition) style.objectPosition = objectPosition;
	if (objectFit) style.objectFit = objectFit;

	rest.lismClass = atts(lismClass, `a--media`);
	rest.style = style;

	return getFilterProps(rest);
}
