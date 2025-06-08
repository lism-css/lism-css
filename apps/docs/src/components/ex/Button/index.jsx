import { Flex } from 'lism-css/react';
import './style.css';

export default function Button({ layout, children, ...props }) {
	const Layout = layout || Flex;
	return (
		<Layout lismClass='c--button' variant='fill' tag='a' td='n' lh='xs' px='30' py='20' ai='c' {...props}>
			{children}
		</Layout>
	);
}
