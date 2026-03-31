import { Lism, type LismComponentProps } from '../Lism';

type LinkBoxProps = LismComponentProps<'a'>;

export default function LinkBox({ as = 'a', children, ...props }: LinkBoxProps) {
	const hasHref = !!props.href;
	// LinkBoxは基本的にリンク要素（aタグ）として機能するため、
	// hrefがないかつ、aタグとしてレンダリングする場合はdivタグに置き換える
	const tag = !hasHref && as === 'a' ? 'div' : as;

	return (
		<Lism isLinkBox as={tag} {...props}>
			{children}
		</Lism>
	);
}
