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
			<Icon viewBox='0 0 256 256' fz='xl' c='main'>
				<path d='M192,96c0,28.51-24.47,52.11-56,55.56V160a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8c26.47,0,48-17.94,48-40s-21.53-40-48-40S80,73.94,80,96a8,8,0,0,1-16,0c0-30.88,28.71-56,64-56S192,65.12,192,96Zm-64,96a16,16,0,1,0,16,16A16,16,0,0,0,128,192Z'></path>
			</Icon>
			<Accordion.Label fw='bold'>{children}</Accordion.Label>
			<Accordion.Icon />
		</Accordion.Header>
	);
}
export function A({ children }) {
	return (
		<Accordion.Body my-s='30' isFlow='s'>
			{children}
		</Accordion.Body>
	);
}
