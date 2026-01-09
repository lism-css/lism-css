import atts from '../lib/helper/atts';
import isTokenValue from '../lib/isTokenValue';
import getMaybeCssVar from '../lib/getMaybeCssVar';
import { type StyleWithCustomProps } from './types';

type CssValue = string | number;

// レイアウト名の型 - src/scss/modules/layout のファイル名から `l--` を取り除いたもの
export type LayoutType =
	| 'center'
	| 'cluster'
	| 'columns'
	| 'flex'
	| 'flow'
	| 'fluidCols'
	| 'frame'
	| 'grid'
	| 'sideMain'
	| 'stack'
	| 'switchCols';

interface PropConfig {
	isVar?: number;
	[key: string]: unknown;
}

interface BaseProps {
	lismClass?: string;
	style?: StyleWithCustomProps;
	_propConfig?: Record<string, PropConfig>;
	[key: string]: unknown;
}

interface GridProps extends BaseProps {
	_propConfig?: Record<string, PropConfig>;
}

interface SideMainProps extends BaseProps {
	sideW?: CssValue;
	mainW?: CssValue;
}

interface FluidColsProps extends BaseProps {
	autoFill?: boolean;
}

interface FlowProps extends BaseProps {
	flow?: CssValue;
}

interface SwitchColsProps extends BaseProps {
	breakSize?: CssValue;
}

export default function getLayoutProps(layout: LayoutType | undefined, props: BaseProps): BaseProps {
	if (!layout) return props;

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
	} else if (layout === 'sideMain') {
		return getSideMainProps(rest);
	} else if (layout === 'fluidCols') {
		return getLiquidProps(rest);
	} else if (layout === 'switchCols') {
		return getSwitchColsProps(rest);
	}

	return rest;
}

function geGridProps({ _propConfig = {}, ...props }: GridProps): BaseProps {
	// gt系のベース値は l--grid は 変数のみでいい
	_propConfig.gta = { isVar: 1 };
	_propConfig.gtc = { isVar: 1 };
	_propConfig.gtr = { isVar: 1 };

	props._propConfig = _propConfig;
	return props;
}

function getSideMainProps({ sideW, mainW, style = {}, ...props }: SideMainProps): BaseProps {
	if (null != sideW) style['--sideW'] = getMaybeCssVar(sideW, 'sz');
	if (null != mainW) style['--mainW'] = getMaybeCssVar(mainW, 'sz');

	props.style = style;
	return props;
}

function getLiquidProps({ autoFill, style = {}, ...props }: FluidColsProps): BaseProps {
	if (autoFill) style['--autoMode'] = 'auto-fill';
	props.style = style;
	return props;
}

function getFlowProps({ flow, style = {}, ...props }: FlowProps): BaseProps {
	if (isTokenValue('flow', flow)) {
		props.lismClass = atts(props.lismClass, `-flow:${flow}`);
	} else if (flow) {
		props.lismClass = atts(props.lismClass, `-flow:`);
		style['--flow'] = getMaybeCssVar(flow, 'space');
	}
	props.style = style;

	return props;
}

function getSwitchColsProps({ breakSize, style = {}, ...props }: SwitchColsProps): BaseProps {
	if (breakSize) style['--breakSize'] = getMaybeCssVar(breakSize, 'sz');
	props.style = style;
	return props;
}
