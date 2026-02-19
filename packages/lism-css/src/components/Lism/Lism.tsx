import type { ComponentPropsWithoutRef, ElementType, ReactNode, JSX } from 'react';
import getLismProps, { type LismProps } from '../../lib/getLismProps';
import { type LayoutSpecificProps } from '../../lib/types/LayoutProps';

/**
 * Lism コンポーネントの Props 型
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 *
 */
export type LismComponentProps<T extends ElementType = 'div'> = (LismProps & LayoutSpecificProps) &
	Omit<ComponentPropsWithoutRef<T>, keyof LismProps> & {
		/** レンダリングするコンポーネントまたは要素 */
		as?: T;
		/** レンダリングするHTML要素のタグ名（文字列のみ）*/
		tag?: keyof JSX.IntrinsicElements;
		/** 子要素 */
		children?: ReactNode;
		/** getLismProps を経由せずに直接渡す追加の props */
		exProps?: Record<string, unknown>;
	};

/**
 * Lism Propsを処理できるだけのコンポーネント
 */
export default function Lism<T extends ElementType = 'div'>({ children, as, tag, exProps, ...props }: LismComponentProps<T>) {
	const Component = (as || tag || 'div') as ElementType;

	return (
		<Component {...getLismProps(props)} {...exProps}>
			{children}
		</Component>
	);
}

function Test() {
	return (
		<Lism p={'10px'} layout='grid' gar='10px' as='section'>
			<div>Test</div>
		</Lism>
	);
}
