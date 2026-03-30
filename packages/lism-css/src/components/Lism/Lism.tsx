import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';
import getLismProps, { type LismProps } from '../../lib/getLismProps';
import { type LayoutSpecificProps } from '../../lib/types/LayoutProps';
// React では kebab-case スタイルは実行時に無視されるため camelCase のみ許容する
type ReactStyleWithCustomProps = CSSProperties & Record<`--${string}`, string | number | undefined>;

/** HTML 要素 Props と共通オプションの基底型 */
type LismBaseProps<T extends ElementType> = Omit<ComponentPropsWithoutRef<T>, keyof LismProps | 'style'> & {
	/** レンダリングするコンポーネントまたは要素 */
	as?: T;
	/** 子要素 */
	children?: ReactNode;
	/** getLismProps を経由せずに直接渡す追加の props */
	exProps?: Record<string, unknown>;
	/** React では camelCase のみ有効（kebab-case は実行時に無視される） */
	style?: ReactStyleWithCustomProps;
};

/**
 * Lism コンポーネントの Props 型
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 */
export type LismComponentProps<T extends ElementType = 'div'> = Omit<LismProps, 'style'> & LayoutSpecificProps & LismBaseProps<T>;

/**
 * layout が固定されたレイアウトコンポーネントの Props 型
 * layout プロパティは固定されるため受け付けない
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 * @template L - レイアウト固有の追加 Props 型
 */
export type LayoutComponentProps<T extends ElementType = 'div', L = object> = Omit<LismProps, 'layout' | 'style'> &
	Omit<L, 'layout'> &
	LismBaseProps<T>;

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
