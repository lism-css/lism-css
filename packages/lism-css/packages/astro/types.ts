/**
 * Astro 用の Lism Props 型
 *
 * @see https://github.com/withastro/roadmap/discussions/601
 * @see https://github.com/withastro/roadmap/discussions/398
 */
import type { LismProps } from 'lism-css/lib/getLismProps';
import type { LayoutType, CssValue } from 'lism-css/lib/types/LayoutProps';

/**
 * React では LayoutSpecificProps（判別可能ユニオン・12メンバー）を使用しているが、
 * Astro ではいまとのところジェネリクスを用いていないので AstroHTMLAttributes（8つの HTML 属性型の intersection）が
 * 常に全体に交差されるため、12パターン × 巨大な型で TS2590 が発生する。
 * React では ComponentPropsWithoutRef<T> の T が具体的な1要素に確定するため問題にならない。
 * Astro 用にはフラットな型を使用して回避する。
 */
export interface AstroLayoutProps {
	layout?: LayoutType;
	flow?: CssValue;
	autoFill?: boolean;
	sideW?: CssValue;
	mainW?: CssValue;
	breakSize?: CssValue;
}

/** Polymorphic 型と組み合わせて使う共通ベース型 */
export type AstroLismBaseProps = LismProps &
	AstroLayoutProps & {
		exProps?: Record<string, unknown>;
	};

/** layout が固定されたレイアウトコンポーネント向けベース型 */
export type AstroLismFixedLayoutProps = Omit<LismProps, 'layout'> & {
	exProps?: Record<string, unknown>;
};
