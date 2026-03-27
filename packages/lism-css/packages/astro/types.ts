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
import type { LismProps } from '../../src/lib/getLismProps';
import type { LayoutSpecificProps } from '../../src/lib/types/LayoutProps';

type AstroHTMLAttributes = astroHTML.JSX.HTMLAttributes &
	astroHTML.JSX.AnchorHTMLAttributes &
	astroHTML.JSX.ImgHTMLAttributes &
	astroHTML.JSX.ButtonHTMLAttributes &
	astroHTML.JSX.FormHTMLAttributes &
	astroHTML.JSX.InputHTMLAttributes &
	astroHTML.JSX.SelectHTMLAttributes &
	astroHTML.JSX.TextareaHTMLAttributes;

export type AstroLismProps = LismProps &
	LayoutSpecificProps &
	AstroHTMLAttributes & {
		as?: HTMLTag;
		exProps?: Record<string, unknown>;
	};
