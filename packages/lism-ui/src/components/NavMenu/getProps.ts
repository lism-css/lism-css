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

export function getRootProps({ hovC, hovBgc, itemP, style = {}, ...props }: NavMenuRootProps) {
  const computedStyle = { ...style };

  if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
  if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
  if (itemP) computedStyle['--_item-p'] = getMaybeCssVar(itemP, 'space');

  return {
    as: 'ul',
    style: computedStyle,
    ...props,
  };
}

export function getNestProps(props: Record<string, unknown>) {
  return {
    as: 'ul',
    'px-s': '20',
    ...props,
  };
}

export function getItemProps(props: Record<string, unknown>) {
  return {
    as: 'li',
    ...props,
  };
}

export function getLinkProps({ href, as = 'span', ...props }: NavMenuLinkProps) {
  return {
    as: href ? 'a' : as,
    href,
    c: 'inherit',
    ...props,
  };
}
