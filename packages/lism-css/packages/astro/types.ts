/**
 * Astro 用の Lism Props 型
 *
 * Astro テンプレートではコンポーネント呼び出し時にジェネリクスを渡せないため、
 * React の ElementType に依存せず、as を任意の文字列で受け取る。
 * astroHTML.JSX の HTML 属性型を union し、as で要素を切り替えた際の
 * 要素固有属性（href, src 等）も受け入れられるようにする。
 *
 * @see https://github.com/withastro/roadmap/discussions/601
 * @see https://github.com/withastro/roadmap/discussions/398
 */
import type { HTMLTag } from 'astro/types';
import type { LismProps } from 'lism-css/lib/getLismProps';
import type { LayoutType, CssValue } from 'lism-css/lib/types/LayoutProps';

type AstroHTMLAttributesRaw = astroHTML.JSX.HTMLAttributes &
	astroHTML.JSX.AnchorHTMLAttributes &
	astroHTML.JSX.ImgHTMLAttributes &
	astroHTML.JSX.ButtonHTMLAttributes &
	astroHTML.JSX.FormHTMLAttributes &
	astroHTML.JSX.InputHTMLAttributes &
	astroHTML.JSX.SelectHTMLAttributes &
	astroHTML.JSX.TextareaHTMLAttributes;

/** LismProps と同名のキーを除外し、Lism 側の型を優先させる */
type AstroHTMLAttributes = Omit<AstroHTMLAttributesRaw, keyof LismProps | keyof AstroLayoutProps>;

/**
 * LayoutSpecificProps（判別可能ユニオン）はレスポンシブ配列型と交差すると
 * 型解決が破綻するため、Astro 用にはフラットな型を使用する。
 */
type AstroLayoutProps = {
	layout?: LayoutType;
	flow?: CssValue;
	autoFill?: boolean;
	sideW?: CssValue;
	mainW?: CssValue;
	breakSize?: CssValue;
};

export type AstroLismProps = LismProps &
	AstroLayoutProps &
	AstroHTMLAttributes & {
		as?: HTMLTag;
		exProps?: Record<string, unknown>;
	};
