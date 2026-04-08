/**
 * NavMenu コンポーネントの共通プロパティ処理
 */
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';

export type NavMenuRootProps = {
  hovC?: string;
  hovBgc?: string;
  itemP?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export type NavMenuLinkProps = {
  href?: string;
  as?: string;
  [key: string]: unknown;
};

export function getRootProps({ hovC, hovBgc, itemP, style = {}, ...props }: NavMenuRootProps): Record<string, unknown> {
  const computedStyle = { ...style };

  if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
  if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
  if (itemP) computedStyle['--_item-p'] = getMaybeCssVar(itemP, 'space');

  return {
    lismClass: 'c--navMenu',
    as: 'ul',
    style: computedStyle,
    ...props,
  };
}

export function getNestProps(props: Record<string, unknown>): Record<string, unknown> {
  return {
    lismClass: 'c--navMenu_nest',
    as: 'ul',
    'px-s': '20',
    ...props,
  };
}

export function getItemProps(props: Record<string, unknown>): Record<string, unknown> {
  return {
    lismClass: 'c--navMenu_item',
    as: 'li',
    ...props,
  };
}

export function getLinkProps({ href, as = 'span', ...props }: NavMenuLinkProps): Record<string, unknown> {
  return {
    lismClass: 'c--navMenu_link',
    as: href ? 'a' : as,
    href,
    c: 'inherit',
    ...props,
  };
}
