import { Lism } from 'lism-css/react';
import './style.css';

export default function Badge({ children, ...props }) {
	return (
		<Lism
			lismClass='c--button'
			tag='a'
			d='if'
			td='n'
			lh='xs'
			px='30'
			py='20'
			ai='c'
			hov='fade'
			trs
			{...props}
		>
			{children}
		</Lism>
	);
}
