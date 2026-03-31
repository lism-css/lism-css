import type { ComponentPropsWithoutRef, CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import getLismProps, { type LismProps } from '../../lib/getLismProps';
import { type LayoutSpecificProps } from '../../lib/types/LayoutProps';
// React では kebab-case スタイルは実行時に無視されるため camelCase のみ許容する
type ReactStyleWithCustomProps = CSSProperties & Record<`--${string}`, string | number | undefined>;

/** 要素固有の HTML Props + 共通オプション */
type LismElementProps<T extends ElementType> = Omit<ComponentPropsWithoutRef<T>, 'style'> & {
	as?: T;
	children?: ReactNode;
	exProps?: Record<string, unknown>;
	/** React では camelCase のみ有効（kebab-case は実行時に無視される） */
	style?: ReactStyleWithCustomProps;
};

/** HTML 属性のベースライン（T がジェネリクスのままでも id 等が補完される） */
type LismHtmlBaseProps = Omit<HTMLAttributes<HTMLElement>, 'style'>;

/**
 * Lism コンポーネントの Props 型
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 */
export type LismComponentProps<T extends ElementType = 'div'> = Omit<LismProps, 'style'> &
	LismHtmlBaseProps &
	LayoutSpecificProps &
	LismElementProps<T>;

/**
 * layout が固定されたレイアウトコンポーネントの Props 型
 * layout プロパティは固定されるため受け付けない
 * @template T - レンダリングする要素の型（デフォルトは 'div'）
 * @template L - レイアウト固有の追加 Props 型
 */
export type LayoutComponentProps<T extends ElementType = 'div', L = object> = Omit<LismProps, 'layout' | 'style'> &
	LismHtmlBaseProps &
	Omit<L, 'layout'> &
	LismElementProps<T>;

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
