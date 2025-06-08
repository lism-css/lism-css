import { Icon, Accordion } from 'lism-css/react';

export function Root({ children }) {
	return (
		<Accordion.Root lismClass='c--faq' p='30' bgc='base-2' bdrs='20'>
			{children}
		</Accordion.Root>
	);
}
export function Q({ children }) {
	return (
		<Accordion.Header>
			<Icon icon='question' fz='2xl' />
			<Accordion.Label>{children}</Accordion.Label>
			<Accordion.Icon />
		</Accordion.Header>
	);
}
export function A({ children }) {
	return (
		<Accordion.Body mbs='30' isFlow='s'>
			{children}
		</Accordion.Body>
	);
}
