/**
 * NavMenu コンポーネントの共通プロパティ処理
 */
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import atts from 'lism-css/lib/helper/atts';

export type NavMenuRootProps = {
  hovC?: string;
  hovBgc?: string;
  itemP?: string;
  className?: string;
  style?: Record<string, string>;
  [key: string]: unknown;
};

export type NavMenuLinkProps = {
  href?: string;
  as?: string;
  className?: string;
  [key: string]: unknown;
};

export function getRootProps({ hovC, hovBgc, itemP, className, style = {}, ...props }: NavMenuRootProps) {
  const computedStyle = { ...style };

  if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
  if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
  if (itemP) computedStyle['--_item-p'] = getMaybeCssVar(itemP, 'space');

  return {
    className: atts(className, 'c--navMenu'),
    as: 'ul',
    style: computedStyle,
    ...props,
  };
}

export function getNestProps({ className, ...props }: { className?: string; [key: string]: unknown }) {
  return {
    className: atts(className, 'c--navMenu_nest'),
    as: 'ul',
    'px-s': '20',
    ...props,
  };
}

export function getItemProps({ className, ...props }: { className?: string; [key: string]: unknown }) {
  return {
    className: atts(className, 'c--navMenu_item'),
    as: 'li',
    ...props,
  };
}

export function getLinkProps({ href, as = 'span', className, ...props }: NavMenuLinkProps) {
  return {
    className: atts(className, 'c--navMenu_link'),
    as: href ? 'a' : as,
    href,
    c: 'inherit',
    ...props,
  };
}
