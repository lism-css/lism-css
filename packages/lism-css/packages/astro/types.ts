/**
 * Astro 用の Lism Props 型
 *
 * @see https://github.com/withastro/roadmap/discussions/601
 * @see https://github.com/withastro/roadmap/discussions/398
 */
import type { LismProps } from 'lism-css/lib/getLismProps';
import type { LayoutSpecificProps } from 'lism-css/lib/types/LayoutProps';

/** Polymorphic 型と組み合わせて使う共通ベース型 */
export type AstroLismBaseProps = LismProps &
	LayoutSpecificProps & {
		exProps?: Record<string, unknown>;
	};

/** layout が固定されたレイアウトコンポーネント向けベース型 */
export type AstroLismFixedLayoutProps = Omit<LismProps, 'layout'> & {
	exProps?: Record<string, unknown>;
};
