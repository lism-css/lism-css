import { Flex } from 'lism-css/react';
import './style.css';

export default function Button({ layout, children, ...props }) {
	const Layout = layout || Flex;

	// c--button では c, bgc は 変数で受け取る
	const _propConfig = {
		c: { isVar: 1 },
		bgc: { isVar: 1 },
	};

	return (
		<Layout lismClass='c--button' tag='a' td='n' ai='c' hov='op' _propConfig={_propConfig} {...props}>
			{children}
		</Layout>
	);
}
