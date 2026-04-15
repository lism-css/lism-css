import { Lism, Stack, Flex, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import '../_style.css';

type RootProps = {
  hovC?: string;
  hovBgc?: string;
  itemP?: string;
};

export function Root({ children, className, hovC, hovBgc, itemP, style, ...props }: RootProps & LismComponentProps) {
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

export function Nest({ children, className, ...props }: LismComponentProps) {
  return (
    <Stack as="ul" className={atts(className, 'c--navMenu_nest')} px-s="20" {...props}>
      {children}
    </Stack>
  );
}

export function Item({ children, className, ...props }: LismComponentProps) {
  return (
    <Lism as="li" className={atts(className, 'c--navMenu_item')} {...props}>
      {children}
    </Lism>
  );
}

type LinkProps = LismComponentProps & { href?: string };

export function Link({ children, className, ...props }: LinkProps) {
  return (
    <Flex as={props.href ? 'a' : 'span'} className={atts(className, 'c--navMenu_link')} c="inherit" {...props}>
      {children}
    </Flex>
  );
}
