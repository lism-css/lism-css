import { Lism } from 'lism-css/react';
import './style.css';

export default function Badge({ children, ...props }) {
	// c--badge では c, bgc は 変数で受け取る
	const _propConfig = {
		c: { isVar: 1 },
		bgc: { isVar: 1 },
	};
	return (
		<Lism lismClass='c--badge' tag='span' d='inline-flex' fz='s' py='5' px='20' lh='s' bdrs='10' _propConfig={_propConfig} {...props}>
			{children}
		</Lism>
	);
}
