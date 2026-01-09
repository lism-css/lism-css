import { Lism, Stack, Flex } from 'lism-css/react';
import { getRootProps, getNestProps, getItemProps, getLinkProps } from '../getProps';
import '../_style.css';

export function Root({ children, ...props }) {
	return <Stack {...getRootProps(props)}>{children}</Stack>;
}

export function Nest({ children, ...props }) {
	return <Stack {...getNestProps(props)}>{children}</Stack>;
}

export function Item({ children, ...props }) {
	return <Lism {...getItemProps(props)}>{children}</Lism>;
}

export function Link({ children, ...props }) {
	return <Flex {...getLinkProps(props)}>{children}</Flex>;
}
