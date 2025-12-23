import { Flex } from 'lism-css/react';
import './style.css';

export default function Button({ layout = 'flex', children, ...props }) {
	// c--button では c, bgc は 変数で受け取る
	const _propConfig = {
		c: { isVar: 1 },
		bgc: { isVar: 1 },
	};

	return (
		<Flex lismClass='c--button' tag='a' lh='s' py='10' px='20' hov='o' _propConfig={_propConfig} {...props}>
			{children}
		</Flex>
	);
}
