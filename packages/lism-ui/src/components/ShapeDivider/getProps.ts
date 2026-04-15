import atts from 'lism-css/lib/helper/atts';

export type ShapeDividerProps = {
  viewBox?: string;
  isAnimation?: boolean;
  isEmpty?: boolean;
  level?: number;
  stretch?: string;
  offset?: string;
  flip?: string;
  className?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export default function getProps({
  viewBox,
  isAnimation,
  isEmpty,
  level = 5,
  stretch,
  offset,
  flip,
  className,
  style = {},
  ...restProps
}: ShapeDividerProps) {
  if (level === 0) return null;

  const computedStyle: Record<string, string | undefined> = { ...style };
  computedStyle['--level'] = level != null ? String(level) : undefined;
  computedStyle['--_inner-offset'] = offset ?? undefined;
  computedStyle['--_inner-stretch'] = stretch ?? undefined;

  const _props: Record<string, unknown> = {
    className: atts(className, 'c--shapeDivider'),
    'max-sz': 'full',
    'aria-hidden': 'true',
  };
  if (flip) _props['data-flip'] = flip;
  if (isAnimation) _props['data-has-animation'] = 'true';

  return {
    ..._props,
    style: computedStyle,
    viewBox,
    isEmpty,
    ...restProps,
  };
}
