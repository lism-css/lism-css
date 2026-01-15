import type { ElementType, ReactNode } from 'react';
import getLismProps, { type LismPropsDataInput } from '../../lib/getLismProps';

/**
 * Lism コンポーネントの Props 型
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 */
export type LismProps<T extends ElementType = 'div'> = LismPropsDataInput & {
	/** レンダリングするコンポーネントまたは要素 */
	as?: T;
	/** レンダリングするHTML要素のタグ名（文字列のみ） */
	tag?: keyof JSX.IntrinsicElements;
	/** 子要素 */
	children?: ReactNode;
	/** getLismProps を経由せずに直接渡す追加の props */
	exProps?: Record<string, unknown>;
};

/**
 * Lism Propsを処理できるだけのコンポーネント
 */
export default function Lism<T extends ElementType = 'div'>({ children, as, tag, exProps, ...props }: LismProps<T>) {
	// tagは文字列のみ。（asはコンポーネントも指定できる。）
	// if (tag && typeof tag !== 'string') {
	// 	console.error('@Lism : "tag" prop should be a string.');
	// }

	const JSX = as || tag || 'div';

	return (
		<JSX {...getLismProps(props)} {...exProps}>
			{children}
		</JSX>
	);
}
