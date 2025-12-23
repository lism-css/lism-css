/**
 * Lism CSS Astro コンポーネントの型定義
 * NOTE: 公式に型定義が提供されていないため、暫定的に定義
 */

declare module 'lism-css/astro' {
	import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
	import type { HTMLAttributes } from 'astro/types';

	// レスポンシブ対応の値型
	export type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T } | (T | null)[];

	// 基本Props
	export interface LismBaseProps {
		// タグの変更
		tag?: string;
		// クラス
		class?: string;
		'class:list'?: any;

		// Layout - Padding
		p?: ResponsiveValue<string | number>;
		px?: ResponsiveValue<string | number>;
		py?: ResponsiveValue<string | number>;
		'px-s'?: ResponsiveValue<string | number>;
		'px-e'?: ResponsiveValue<string | number>;
		'py-s'?: ResponsiveValue<string | number>;
		'py-e'?: ResponsiveValue<string | number>;

		// Layout - Margin
		m?: ResponsiveValue<string | number>;
		mx?: ResponsiveValue<string | number>;
		my?: ResponsiveValue<string | number>;
		'mx-s'?: ResponsiveValue<string | number>;
		'mx-e'?: ResponsiveValue<string | number>;
		'my-s'?: ResponsiveValue<string | number>;
		'my-e'?: ResponsiveValue<string | number>;

		// Sizing
		w?: ResponsiveValue<string | number>;
		h?: ResponsiveValue<string | number>;

		// Display
		d?: ResponsiveValue<string>;
		pos?: ResponsiveValue<string>;
		z?: ResponsiveValue<string | number>;

		// Flexbox & Grid
		g?: ResponsiveValue<string | number>;
		ai?: ResponsiveValue<string>;
		jc?: ResponsiveValue<string>;
		fxw?: ResponsiveValue<string>;

		// Typography
		fz?: ResponsiveValue<string | number>;
		lh?: ResponsiveValue<string | number>;
		ff?: ResponsiveValue<string>;
		fw?: ResponsiveValue<string | number>;
		ta?: ResponsiveValue<string>;
		td?: ResponsiveValue<string>;
		tt?: ResponsiveValue<string>;
		lts?: ResponsiveValue<string | number>;

		// Colors
		c?: ResponsiveValue<string>;
		bgc?: ResponsiveValue<string>;

		// Border
		bd?: ResponsiveValue<string>;
		bdrs?: ResponsiveValue<string | number>;

		// Other
		ar?: ResponsiveValue<string>;
		op?: ResponsiveValue<string | number>;
		ov?: ResponsiveValue<string>;

		// Hover
		hover?: Record<string, any>;

		// その他のHTMLAttributes
		[key: string]: any;
	}

	// コンポーネント型
	export const Lism: AstroComponentFactory;
	export const Box: AstroComponentFactory;
	export const Flow: AstroComponentFactory;
	export const Flex: AstroComponentFactory;
	export const Cluster: AstroComponentFactory;
	export const Stack: AstroComponentFactory;
	export const Grid: AstroComponentFactory;
	export const Columns: AstroComponentFactory;
	export const Center: AstroComponentFactory;
	export const SideMain: AstroComponentFactory;
	export const Frame: AstroComponentFactory;
	export const Container: AstroComponentFactory;
	export const Layer: AstroComponentFactory;
	export const LinkBox: AstroComponentFactory;
	export const Decorator: AstroComponentFactory;
	export const Divider: AstroComponentFactory;
	export const Icon: AstroComponentFactory;
	export const Media: AstroComponentFactory;
	export const Spacer: AstroComponentFactory;
	export const Link: AstroComponentFactory;
	export const Text: AstroComponentFactory;
	export const Dummy: AstroComponentFactory;
	export const Accordion: AstroComponentFactory;
	export const Modal: {
		OpenBtn: AstroComponentFactory;
		Root: AstroComponentFactory;
		Inner: AstroComponentFactory;
		CloseBtn: AstroComponentFactory;
		Body: AstroComponentFactory;
	};
	export const Tabs: {
		Root: AstroComponentFactory;
		Item: AstroComponentFactory;
		Tab: AstroComponentFactory;
		Panel: AstroComponentFactory;
	};

	// HTML タグコンポーネント（HTML.div, HTML.p, HTML.h など）
	export const HTML: {
		[key: string]: AstroComponentFactory;
	};
}
