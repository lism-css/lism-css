import isTokenValue from '../lib/isTokenValue';
import getMaybeCssVar from '../lib/getMaybeCssVar';
import { type StyleWithCustomProps } from './types';
import { type LayoutType, type CssValue } from './types/LayoutProps';

export type { LayoutType };

interface PropConfig {
  isVar?: number;
  [key: string]: unknown;
}

// Layout固有 props（消費して除去される）
interface LayoutOwnProps {
  flow?: CssValue;
  autoFill?: boolean;
  sideW?: CssValue;
  mainW?: CssValue;
  breakSize?: CssValue;
}

type LayoutSpecificKeys = keyof LayoutOwnProps;

export interface BaseProps {
  lismClass?: string;
  primitiveClass?: string[];
  style?: StyleWithCustomProps;
  _propConfig?: Record<string, PropConfig>;
}

interface InputProps extends BaseProps, LayoutOwnProps {}

// primitiveClass への安全な push（常に新しい配列を返して非破壊に扱う）
function pushPrimitive(existing: string[] | undefined, ...classes: string[]): string[] {
  return [...(existing ?? []), ...classes];
}

export default function getLayoutProps<P extends InputProps>(layout: LayoutType | undefined, props: P): Omit<P, LayoutSpecificKeys> & BaseProps {
  if (!layout) return props;

  const rest: InputProps = {
    ...props,
    primitiveClass: pushPrimitive(props.primitiveClass, `l--${layout}`),
  };

  if (layout === 'flow') {
    return getFlowProps(rest) as Omit<P, LayoutSpecificKeys> & BaseProps;
  } else if (layout === 'sideMain') {
    return getSideMainProps(rest) as Omit<P, LayoutSpecificKeys> & BaseProps;
  } else if (layout === 'fluidCols') {
    return getLiquidProps(rest) as Omit<P, LayoutSpecificKeys> & BaseProps;
  } else if (layout === 'switchCols') {
    return getSwitchColsProps(rest) as Omit<P, LayoutSpecificKeys> & BaseProps;
  }

  return rest as Omit<P, LayoutSpecificKeys> & BaseProps;
}

function getSideMainProps({ sideW, mainW, style, ...props }: InputProps): BaseProps {
  const newStyle: StyleWithCustomProps = { ...style } as StyleWithCustomProps;
  if (null != sideW) newStyle['--sideW'] = getMaybeCssVar(sideW, 'sz');
  if (null != mainW) newStyle['--mainW'] = getMaybeCssVar(mainW, 'sz');

  return { ...props, style: newStyle };
}

function getLiquidProps({ autoFill, style, ...props }: InputProps): BaseProps {
  if (autoFill) return { ...props, style: { ...style, '--autoMode': 'auto-fill' } as StyleWithCustomProps };
  return { ...props, style };
}

function getFlowProps({ flow, style, primitiveClass, ...props }: InputProps): BaseProps {
  if (isTokenValue('flow', flow)) {
    return {
      ...props,
      primitiveClass: pushPrimitive(primitiveClass, `-flow:${flow}`),
      style,
    };
  } else if (flow) {
    return {
      ...props,
      primitiveClass: pushPrimitive(primitiveClass, `-flow:`),
      style: { ...style, '--flow': getMaybeCssVar(flow, 'space') } as StyleWithCustomProps,
    };
  }
  return { ...props, primitiveClass, style };
}

function getSwitchColsProps({ breakSize, style, ...props }: InputProps): BaseProps {
  if (breakSize) return { ...props, style: { ...style, '--breakSize': getMaybeCssVar(breakSize, 'sz') } as StyleWithCustomProps };
  return { ...props, style };
}
