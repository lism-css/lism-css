import { Lism, Stack, Flex } from 'lism-css/react';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import './style.css';

export function Root({ children, hovC, hovBgc, style = {}, ...props }) {
	if (hovBgc) style['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
	if (hovC) style['--hov-c'] = getMaybeCssVar(hovC, 'color');

	return (
		<Stack lismClass='c--navMenu' tag='ul' style={style} {...props}>
			{children}
		</Stack>
	);
}

export function Nest({ children, ...props }) {
	return (
		<Stack lismClass='c--navMenu__nest' tag='ul' pis='30' data-lism-get='bdc' {...props}>
			{children}
		</Stack>
	);
}

export function Item({ children, ...props }) {
	return (
		<Lism lismClass='c--navMenu__item' tag='li' data-lism-get='bdc' skipState {...props}>
			{children}
		</Lism>
	);
}
export function Link({ href, tag = 'span', hov, children, ...props }) {
	if (href) {
		tag = 'a';
		hov = hov || 'fade';
	}
	return (
		<Flex
			lismClass='c--navMenu__link'
			tag={tag}
			href={href}
			hov={hov}
			c='inherit'
			skipState
			data-lism-get='p'
			{...props}
		>
			{children}
		</Flex>
	);
}
