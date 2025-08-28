import { Lism } from '../Lism';

export default function LinkBox({ layout, children, ...props }) {
	const hasHref = !!props.href;
	const tag = hasHref ? 'a' : 'div';
	const LismComponent = layout || Lism;
	return (
		<LismComponent isLinkBox hov='op' tag={tag} {...props}>
			{children}
		</LismComponent>
	);
}
