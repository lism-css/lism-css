import { Lism } from '../Lism';

export default function LinkBox({ children, ...props }) {
	const hasHref = !!props.href;
	const tag = hasHref ? 'a' : 'div';
	return (
		<Lism isLinkBox tag={tag} {...props}>
			{children}
		</Lism>
	);
}
