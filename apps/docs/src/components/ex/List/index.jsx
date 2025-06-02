import { Lism } from 'lism-css/react';
import './style.css';

export default function List({ tag = 'ul', children, ...props }) {
	return (
		<Lism tag={tag} lismClass='c--list' {...props}>
			{children}
		</Lism>
	);
}
