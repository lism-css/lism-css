import atts from '../../lib/helper/atts';

export function getWithSideProps({ lismClass, sideW, mainW, style = {}, ...props }) {
	if (null != sideW) {
		style['--sideW'] = sideW;
	}
	if (null != mainW) {
		style['--mainW'] = mainW;
	}

	return {
		lismClass: atts(lismClass, `l--withSide`),
		style,
		...props,
	};
}
