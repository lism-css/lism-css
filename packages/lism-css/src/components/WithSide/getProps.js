import atts from '../../lib/helper/atts';

export function getWithSideProps({ lismClass, sideW, mainW, style = {}, ...props }) {
	if (null != sideW) {
		style['--_side-w'] = sideW;
	}
	if (null != mainW) {
		style['--_main-w'] = mainW;
	}

	return {
		lismClass: atts(lismClass, `l--withSide`),
		style,
		...props,
	};
}
