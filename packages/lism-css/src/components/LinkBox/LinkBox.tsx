import { Lism, type LismComponentProps } from '../Lism';

type LinkBoxProps = LismComponentProps<'a'>;

export default function LinkBox({ children, ...props }: LinkBoxProps) {
	const hasHref = !!props.href;
	const tag = hasHref ? 'a' : 'div';
	return (
		<Lism isLinkBox tag={tag} {...props}>
			{children}
		</Lism>
	);
}
