import { Lism } from 'lism-css/react';
import './style.css';

export default function Button({ layout = 'flex', children, ...props }) {
	// c--button では c, bgc は 変数で受け取る
	const _propConfig = {
		c: { isVar: 1 },
		bgc: { isVar: 1 },
	};

	return (
		<Lism lismClass='c--button' layout='flex' tag='a' td='none' ai='center' hov='o' _propConfig={_propConfig} {...props}>
			{children}
		</Lism>
	);
}
