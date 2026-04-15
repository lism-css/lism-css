import getBpData from './getBpData';
import getMaybeCssVar from './getMaybeCssVar';
import { type StyleWithCustomProps } from './types';
import { type AtomicType } from './types/AtomicProps';
import { type CssValue } from './types/LayoutProps';

export type { AtomicType };

interface PropConfig {
  isVar?: number;
  [key: string]: unknown;
}

// Atomic 固有 props（消費して除去される）
interface AtomicOwnProps {
  // decorator 固有
  size?: CssValue;
  clipPath?: string;
  boxSizing?: string;
}

type AtomicSpecificKeys = keyof AtomicOwnProps;

export interface BaseProps {
  primitiveClass?: string[];
  style?: StyleWithCustomProps;
  _propConfig?: Record<string, PropConfig>;
  // spacer が触る w/h（後段の analyzeLismProp に委ねる）
  w?: unknown;
  h?: unknown;
  // decorator が触る ar
  ar?: unknown;
}

interface InputProps extends BaseProps, AtomicOwnProps {
  [key: string]: unknown;
}

function pushPrimitive(existing: string[] | undefined, ...classes: string[]): string[] {
  return [...(existing ?? []), ...classes];
}

// スペーストークンへの一括変換（w / h 用）
// 値は BP 形 ({base, md, ...}) のまま返し、後段の analyzeLismProp に渡す。
// トークン → CSS var への解決はここでしかできないため（後段は token 名を知らない）、
// BP 形を維持したまま各ブレークポイント値に getMaybeCssVar を適用する。
function toSpaceValue(val: unknown): unknown {
  const bpObj = getBpData(val as Parameters<typeof getBpData>[0]);
  const result: Record<string, unknown> = {};
  Object.entries(bpObj).forEach(([key, v]) => {
    result[key] = getMaybeCssVar(v as string | number, 'space');
  });
  return result;
}

export default function getAtomicProps<P extends InputProps>(atomic: AtomicType | undefined, props: P): Omit<P, AtomicSpecificKeys> & BaseProps {
  if (!atomic) return props;

  const rest: InputProps = {
    ...props,
    primitiveClass: pushPrimitive(props.primitiveClass, `a--${atomic}`),
  };

  if (atomic === 'spacer') {
    return getSpacerProps(rest) as Omit<P, AtomicSpecificKeys> & BaseProps;
  }
  if (atomic === 'decorator') {
    return getDecoratorProps(rest) as Omit<P, AtomicSpecificKeys> & BaseProps;
  }
  // divider / icon は a--* クラスの付与以外に固有処理なし
  return rest as Omit<P, AtomicSpecificKeys> & BaseProps;
}

function getSpacerProps(props: InputProps): InputProps {
  const next: InputProps = { ...props };
  if (null != next.w) next.w = toSpaceValue(next.w);
  if (null != next.h) next.h = toSpaceValue(next.h);
  return next;
}

function getDecoratorProps({ size, clipPath, boxSizing, style, ...props }: InputProps): InputProps {
  const newStyle: StyleWithCustomProps = { ...style } as StyleWithCustomProps;
  if (clipPath) newStyle.clipPath = clipPath;
  if (boxSizing) newStyle.boxSizing = boxSizing as StyleWithCustomProps['boxSizing'];

  const next: InputProps = { ...props, style: newStyle };
  if (size) {
    next.ar = '1/1';
    next.w = size;
  }
  return next;
}
