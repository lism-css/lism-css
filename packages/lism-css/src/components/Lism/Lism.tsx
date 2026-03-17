import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import getLismProps, { type LismProps } from '../../lib/getLismProps';
import { type LayoutSpecificProps } from '../../lib/types/LayoutProps';

/** HTML 要素 Props と共通オプションの基底型 */
type LismBaseProps<T extends ElementType> = Omit<ComponentPropsWithoutRef<T>, keyof LismProps> & {
	/** レンダリングするコンポーネントまたは要素 */
	as?: T;
	/** 子要素 */
	children?: ReactNode;
	/** getLismProps を経由せずに直接渡す追加の props */
	exProps?: Record<string, unknown>;
};

/**
 * Lism コンポーネントの Props 型
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 */
export type LismComponentProps<T extends ElementType = 'div'> = LismProps & LayoutSpecificProps & LismBaseProps<T>;

/**
 * layout が固定されたレイアウトコンポーネントの Props 型
 * layout プロパティは固定されるため受け付けない
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 * @template L - レイアウト固有の追加 Props 型
 */
export type LayoutComponentProps<T extends ElementType = 'div', L = object> = Omit<LismProps, 'layout'> & Omit<L, 'layout'> & LismBaseProps<T>;

/**
 * Lism Propsを処理できるだけのコンポーネント
 */
export default function Lism<T extends ElementType = 'div'>({ children, as, exProps, ...props }: LismComponentProps<T>) {
	const Component = as || 'div';

	return (
		<Component {...getLismProps(props)} {...exProps}>
			{children}
		</Component>
	);
}
