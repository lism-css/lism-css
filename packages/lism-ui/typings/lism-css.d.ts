/**
 * lism-css/react の型定義オーバーライド（暫定対策）
 *
 * 現状、lism-css のコンポーネント（JSX）から自動生成される型定義では、
 * children, as, tag, exProps などのプロパティが必須として推論されてしまう。
 * これにより lism-ui 側で型エラー（TS2739, TS2741）が発生する。
 *
 * lism-css 本体のTypeScript化が完了したら、このファイルは削除すること。
 *
 * @see packages/lism-css - TypeScript化の進捗を確認
 */
import type { ReactNode, JSX } from 'react';

declare module 'lism-css/react' {
	interface LismProps {
		[x: string]: unknown;
		children?: ReactNode;
		as?: unknown;
		tag?: string;
		exProps?: Record<string, unknown>;
		layout?: string;
		lismClass?: string;
	}

	interface IconProps {
		[x: string]: unknown;
		children?: ReactNode;
		icon?: string;
	}

	interface CenterProps {
		[x: string]: unknown;
		children?: ReactNode;
		isSide?: boolean;
	}

	interface FlowProps {
		[x: string]: unknown;
		children?: ReactNode;
		flow?: string;
	}

	export function Lism(props: LismProps): JSX.Element;
	export function Icon(props: IconProps): JSX.Element;
	export function Center(props: CenterProps): JSX.Element;
	export function Flow(props: FlowProps): JSX.Element;
}
