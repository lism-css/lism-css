import { Stack, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import '../_style.css';

type RootProps = {
  hovC?: string;
  hovBgc?: string;
  itemP?: string;
};

export default function Root({ children, className, hovC, hovBgc, itemP, style, ...props }: RootProps & LismComponentProps) {
  const computedStyle = { ...style };
  if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
  if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
  if (itemP) computedStyle['--_item-p'] = getMaybeCssVar(itemP, 'space');

  return (
    <Stack as="ul" className={atts(className, 'c--navMenu')} style={computedStyle} {...props}>
      {children}
    </Stack>
  );
}
