import { Lism } from 'lism-css/react';
import './style.css';

export default function List({ tag = 'ul', iconC, iconImg, children, style = {}, ...props }) {
	if (iconC) style['--iconC'] = iconC;
	if (iconImg) style['--iconImg'] = iconImg;
	return (
		<Lism tag={tag} lismClass='c--list' style={style} {...props}>
			{children}
		</Lism>
	);
}
