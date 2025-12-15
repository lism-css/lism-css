import atts from '../lib/helper/atts';
import isTokenValue from '../lib/isTokenValue';
import getMaybeCssVar from '../lib/getMaybeCssVar';

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
	} else if (layout === 'liquidGrid') {
		return getLiquidProps(rest);
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
	if (null != sideW) style['--sideW'] = getMaybeCssVar(sideW, 'sz');
	if (null != mainW) style['--mainW'] = getMaybeCssVar(mainW, 'sz');

	props.style = style;
	return props;
}

function getLiquidProps({ autoFill, style = {}, ...props }) {
	if (autoFill) style['--autoMode'] = 'auto-fill';
	props.style = style;
	return props;
}

function getFlowProps({ flow, style = {}, ...props }) {
	if (isTokenValue('flow', flow)) {
		props.lismClass = atts(props.lismClass, `-flow:${flow}`);
	} else if (flow) {
		props.lismClass = atts(props.lismClass, `-flow:`);
		style['--flow'] = getMaybeCssVar(flow, 'space');
	}
	props.style = style;

	return props;
}
