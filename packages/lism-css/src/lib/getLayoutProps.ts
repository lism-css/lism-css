import atts from '../lib/helper/atts';
import isTokenValue from '../lib/isTokenValue';
import getMaybeCssVar from '../lib/getMaybeCssVar';
import { type StyleWithCustomProps } from './types';
import { type LayoutType, type CssValue } from './types/LayoutProps';

export type { LayoutType };

interface PropConfig {
	isVar?: number;
	[key: string]: unknown;
}

export interface BaseProps {
	lismClass?: string;
	style?: StyleWithCustomProps;
	_propConfig?: Record<string, PropConfig>;
	// Layout固有 props（消費して除去される）
	flow?: CssValue;
	autoFill?: boolean;
	sideW?: CssValue;
	mainW?: CssValue;
	breakSize?: CssValue;
}

export interface LayoutOutputProps {
	lismClass?: string;
	style?: StyleWithCustomProps;
	_propConfig?: Record<string, PropConfig>;
}

export default function getLayoutProps(layout: LayoutType | undefined, props: BaseProps): LayoutOutputProps {
	if (!layout) return props;

	const rest: BaseProps = {
		...props,
		lismClass: atts(props.lismClass, `l--${layout}`),
	};

	// if (variant) {
	// 	rest.lismClass = atts(rest.lismClass, `${layout}:${variant}`);
	// }

	if (layout === 'flow') {
		return geFlowProps(rest);
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

function geGridProps({ _propConfig = {}, ...props }: BaseProps): LayoutOutputProps {
	// gt系のベース値は l--grid は 変数のみでいい
	_propConfig.gta = { isVar: 1 };
	_propConfig.gtc = { isVar: 1 };
	_propConfig.gtr = { isVar: 1 };

	return { ...props, _propConfig };
}

function getSideMainProps({ sideW, mainW, style, ...props }: BaseProps): LayoutOutputProps {
	const newStyle: StyleWithCustomProps = { ...style } as StyleWithCustomProps;
	if (null != sideW) newStyle['--sideW'] = getMaybeCssVar(sideW, 'sz');
	if (null != mainW) newStyle['--mainW'] = getMaybeCssVar(mainW, 'sz');

	return { ...props, style: newStyle };
}

function getLiquidProps({ autoFill, style, ...props }: BaseProps): LayoutOutputProps {
	if (autoFill) return { ...props, style: { ...style, '--autoMode': 'auto-fill' } as StyleWithCustomProps };
	return { ...props, style };
}

function geFlowProps({ flow, style, ...props }: BaseProps): LayoutOutputProps {
	if (isTokenValue('flow', flow)) {
		props.lismClass = atts(props.lismClass, `-flow:${flow}`);
	} else if (flow) {
		props.lismClass = atts(props.lismClass, `-flow:`);
		style = { ...style, '--flow': getMaybeCssVar(flow, 'space') } as StyleWithCustomProps;
	}
	return { ...props, style };
}

function getSwitchColsProps({ breakSize, style, ...props }: BaseProps): LayoutOutputProps {
	if (breakSize) return { ...props, style: { ...style, '--breakSize': getMaybeCssVar(breakSize, 'sz') } as StyleWithCustomProps };
	return { ...props, style };
}
