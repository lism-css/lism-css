import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import '../_style.css';

type RootProps<T extends ElementType = 'ul'> = LismComponentProps<T> & {
  hovC?: string;
  hovBgc?: string;
  itemP?: string;
};

/**
 * NavMenu のルート要素
 * レイアウトが必要な場合は layout="flex" などで指定する
 */
export default function Root<T extends ElementType = 'ul'>({ children, className, hovC, hovBgc, itemP, style, ...props }: RootProps<T>) {
  const computedStyle = { ...style };
  if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
  if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
  if (itemP) computedStyle['--item-p'] = getMaybeCssVar(itemP, 'space');

  return (
    <Lism as="ul" className={atts(className, 'b--navMenu')} style={computedStyle} {...(props as object)}>
      {children}
    </Lism>
  );
}
