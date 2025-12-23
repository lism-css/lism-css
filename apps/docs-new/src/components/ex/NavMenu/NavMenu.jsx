import { Lism, Stack, Flex } from 'lism-css/react';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import './style.css';

export function Root({ children, hovC, hovBgc, itemP, style = {}, ...props }) {
	if (hovBgc) style['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
	if (hovC) style['--hov-c'] = getMaybeCssVar(hovC, 'color');
	if (itemP) style['--_item-p'] = getMaybeCssVar(itemP, 'space');

	return (
		<Stack lismClass='c--navMenu' tag='ul' style={style} {...props}>
			{children}
		</Stack>
	);
}

export function Nest({ children, ...props }) {
	return (
		<Stack lismClass='c--navMenu_nest' tag='ul' px-s='20' {...props}>
			{children}
		</Stack>
	);
}

export function Item({ children, ...props }) {
	return (
		<Lism lismClass='c--navMenu_item' tag='li' {...props}>
			{children}
		</Lism>
	);
}
export function Link({ href, tag = 'span', children, ...props }) {
	if (href) {
		tag = 'a';
	}
	return (
		<Flex lismClass='c--navMenu_link' tag={tag} href={href} c='inherit' {...props}>
			{children}
		</Flex>
	);
}
