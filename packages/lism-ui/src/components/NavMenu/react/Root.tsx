import type { ElementType } from 'react';
import { Stack, type LayoutComponentProps } from 'lism-css/react';
import type { StackProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import '../_style.css';

type RootProps<T extends ElementType = 'ul'> = LayoutComponentProps<T, StackProps> & {
  hovC?: string;
  hovBgc?: string;
  itemP?: string;
};

export default function Root<T extends ElementType = 'ul'>({ children, className, hovC, hovBgc, itemP, style, ...props }: RootProps<T>) {
  const computedStyle = { ...style };
  if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
  if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
  if (itemP) computedStyle['--_item-p'] = getMaybeCssVar(itemP, 'space');

  return (
    <Stack as="ul" className={atts(className, 'c--navMenu')} style={computedStyle} {...(props as object)}>
      {children}
    </Stack>
  );
}
