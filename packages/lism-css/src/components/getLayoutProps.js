import atts from '../lib/helper/atts';
import isTokenValue from '../lib/isTokenValue';
import getMaybeTokenValue from '../lib/getMaybeTokenValue';

export default function getLayoutProps(layout, props) {
	if (!layout || typeof layout !== 'string') return props;

	const { lismClass, ...rest } = props;
	rest.lismClass = atts(lismClass, `l--${layout}`);

	if (layout === 'flow') {
		return getFlowProps(rest);
	} else if (layout === 'withSide') {
		return getWithSideProps(rest);
	} else if (layout === 'columns') {
		return getColumnsProps(rest);
	}

	return rest;
}

function getWithSideProps({ sideW, mainW, style = {}, ...props }) {
	if (null != sideW) style['--_side-w'] = sideW;
	if (null != mainW) style['--_main-w'] = mainW;

	props.style = style;
	return props;
}

function getColumnsProps({ colSize, autoType, style = {}, ...props }) {
	if (colSize) style['--colSize'] = colSize;
	if (autoType) style['--autoType'] = autoType;

	props.style = style;
	return props;
}

function getFlowProps({ flowGap, style = {}, ...props }) {
	if (isTokenValue('flow', flowGap)) {
		props.lismClass = atts(props.lismClass, `-flow:${flowGap}`);
	} else if (flowGap) {
		style['--flow-gap'] = getMaybeTokenValue('space', flowGap);
	}
	props.style = style;

	return props;
}
