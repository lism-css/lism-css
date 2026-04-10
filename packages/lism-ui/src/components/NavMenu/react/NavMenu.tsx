import type { ElementType } from 'react';
import { Lism, Stack, Flex, type LismComponentProps } from 'lism-css/react';
import { getRootProps, getNestProps, getItemProps, getLinkProps, type NavMenuRootProps, type NavMenuLinkProps } from '../getProps';
import '../_style.css';

export function Root({ children, ...props }: NavMenuRootProps & LismComponentProps) {
  const { as: rootAs, ...rootProps } = getRootProps(props);
  return (
    <Stack as={rootAs as ElementType} {...rootProps}>
      {children}
    </Stack>
  );
}

export function Nest({ children, ...props }: LismComponentProps) {
  const { as: nestAs, ...nestProps } = getNestProps(props);
  return (
    <Stack as={nestAs as ElementType} {...nestProps}>
      {children}
    </Stack>
  );
}

export function Item({ children, ...props }: LismComponentProps) {
  const { as: itemAs, ...itemProps } = getItemProps(props);
  return (
    <Lism as={itemAs as ElementType} {...itemProps}>
      {children}
    </Lism>
  );
}

export function Link({ children, ...props }: NavMenuLinkProps & LismComponentProps) {
  const { as: linkAs, ...linkProps } = getLinkProps(props);
  return (
    <Flex as={linkAs as ElementType} {...linkProps}>
      {children}
    </Flex>
  );
}
