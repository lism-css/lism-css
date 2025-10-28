import atts from '../lib/helper/atts';
import isTokenValue from '../lib/isTokenValue';
import getMaybeTokenValue from '../lib/getMaybeTokenValue';

export default function getLayoutProps(layout, props) {
	if (!layout || typeof layout !== 'string') return props;

	const {
		lismClass,
		//[layout]: variant,
		...rest
	} = props;
	rest.lismClass = atts(lismClass, `l--${layout}`);

	// if (variant) {
	// 	rest.lismClass = atts(rest.lismClass, `${layout}:${variant}`);
	// }

	if (layout === 'flow') {
		return getFlowProps(rest);
	} else if (layout === 'grid') {
		return geGridProps(rest);
	} else if (layout === 'withSide') {
		return getWithSideProps(rest);
	} else if (layout === 'columns') {
		return getColumnsProps(rest);
	}

	return rest;
}

function geGridProps({ _propConfig = {}, ...props }) {
	// gt系のベース値は l--grid は 変数のみでいい
	_propConfig.gta = { isVar: 1 };
	_propConfig.gtc = { isVar: 1 };
	_propConfig.gtr = { isVar: 1 };

	props._propConfig = _propConfig;
	return props;
}

function getWithSideProps({ sideW, mainW, style = {}, ...props }) {
	if (null != sideW) style['--_side-w'] = getMaybeTokenValue('sz', sideW);
	if (null != mainW) style['--_main-w'] = getMaybeTokenValue('sz', mainW);

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
