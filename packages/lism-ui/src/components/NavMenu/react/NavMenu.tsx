import type { ElementType } from 'react';
import { Lism, Stack, Flex, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { getRootProps, getNestProps, getItemProps, getLinkProps, type NavMenuRootProps, type NavMenuLinkProps } from '../getProps';
import '../_style.css';

export function Root({ children, className, ...props }: NavMenuRootProps & LismComponentProps) {
  const { as: rootAs, ...rootProps } = getRootProps(props);
  return (
    <Stack as={rootAs as ElementType} className={atts(className, 'c--navMenu')} {...rootProps}>
      {children}
    </Stack>
  );
}

export function Nest({ children, className, ...props }: LismComponentProps) {
  const { as: nestAs, ...nestProps } = getNestProps(props as Record<string, unknown>);
  return (
    <Stack as={nestAs as ElementType} className={atts(className, 'c--navMenu_nest')} {...nestProps}>
      {children}
    </Stack>
  );
}

export function Item({ children, className, ...props }: LismComponentProps) {
  const { as: itemAs, ...itemProps } = getItemProps(props as Record<string, unknown>);
  return (
    <Lism as={itemAs as ElementType} className={atts(className, 'c--navMenu_item')} {...itemProps}>
      {children}
    </Lism>
  );
}

export function Link({ children, className, ...props }: NavMenuLinkProps & LismComponentProps) {
  const { as: linkAs, ...linkProps } = getLinkProps(props);
  return (
    <Flex as={linkAs as ElementType} className={atts(className, 'c--navMenu_link')} {...linkProps}>
      {children}
    </Flex>
  );
}
