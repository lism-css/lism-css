import atts from '../../lib/helper/atts';
import { mergeFlexContextProps } from '../Flex/getProps';

export function getWithSideProps({ lismClass, sideW, mainW, style = {}, ...props }) {
	if (null != sideW) {
		style['--side-w'] = sideW;
	}
	if (null != mainW) {
		style['--main-w'] = mainW;
	}

	return Object.assign(
		{
			lismClass: atts(lismClass, `l--withSide`),
			style,
		},
		mergeFlexContextProps(props)
	);
}
