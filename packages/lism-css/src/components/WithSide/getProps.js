import atts from '../../lib/helper/atts';
import { mergeFlexContextProps } from '../Flex/getProps';

export function getWithSideProps({ lismClass, sideW, mainW, style = {}, ...props }) {
	if (null != sideW) {
		style['--sideW'] = sideW;
	}
	if (null != mainW) {
		style['--mainW'] = mainW;
	}

	return Object.assign(
		{
			lismClass: atts(lismClass, `l--withSide`),
			style,
		},
		mergeFlexContextProps(props)
	);
}
