/**
 * Astro 用の Lism Props 型
 *
 * Astro テンプレートではコンポーネント呼び出し時にジェネリクスを渡せないため、
 * React の ElementType に依存せず、as を任意の文字列で受け取る。
 *
 * @see https://github.com/withastro/roadmap/discussions/601
 * @see https://github.com/withastro/roadmap/discussions/398
 */
import type { LismProps } from '../../src/lib/getLismProps';
import type { LayoutSpecificProps } from '../../src/lib/types/LayoutProps';

export type AstroLismProps = LismProps &
	LayoutSpecificProps & {
		as?: string;
		exProps?: Record<string, unknown>;
	};
