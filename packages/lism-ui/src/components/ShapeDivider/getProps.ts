export type ShapeDividerProps = {
  viewBox?: string;
  isAnimation?: boolean;
  isEmpty?: boolean;
  level?: number;
  stretch?: string;
  offset?: string;
  flip?: string;
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
  style = {},
  ...restProps
}: ShapeDividerProps): Record<string, unknown> | null {
  if (level === 0) return null;

  const computedStyle: Record<string, string | null> = { ...style };
  computedStyle['--level'] = level != null ? String(level) : null;
  computedStyle['--_inner-offset'] = offset ?? null;
  computedStyle['--_inner-stretch'] = stretch ?? null;

  const _props: Record<string, unknown> = {
    lismClass: 'c--shapeDivider',
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
