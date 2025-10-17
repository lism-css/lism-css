import getLismProps from '../../lib/getLismProps';
import getLayoutProps from '../getLayoutProps';

/**
 * Lism Propsを処理できるだけのコンポーネント
 */
export default function Lism({ children, as, tag, layout, exProps, ...props }) {
	// tagは文字列のみ。（asはコンポーネントも指定できる。）
	// if (tag && typeof tag !== 'string') {
	// 	console.error('@Lism : "tag" prop should be a string.');
	// }

	let JSX = as || tag || 'div';

	return (
		<JSX {...getLismProps(getLayoutProps(layout, props))} {...exProps}>
			{children}
		</JSX>
	);
}
