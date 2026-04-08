import { Lism, Stack, Flex, type LismComponentProps } from 'lism-css/react';
import { getRootProps, getNestProps, getItemProps, getLinkProps, type NavMenuRootProps, type NavMenuLinkProps } from '../getProps';
import '../_style.css';

export function Root({ children, ...props }: NavMenuRootProps & LismComponentProps) {
  return <Stack {...getRootProps(props)}>{children}</Stack>;
}

export function Nest({ children, ...props }: LismComponentProps) {
  return <Stack {...getNestProps(props)}>{children}</Stack>;
}

export function Item({ children, ...props }: LismComponentProps) {
  return <Lism {...getItemProps(props)}>{children}</Lism>;
}

export function Link({ children, ...props }: NavMenuLinkProps & LismComponentProps) {
  return <Flex {...getLinkProps(props)}>{children}</Flex>;
}
