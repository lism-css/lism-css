// Pagefind default-ui の型定義
declare module '@pagefind/default-ui' {
	export interface PagefindUIOptions {
		element: string | HTMLElement;
		showSubResults?: boolean;
		showImages?: boolean;
		excerptLength?: number;
		resetStyles?: boolean;
		bundlePath?: string;
		debounceTimeoutMs?: number;
		mergeIndex?: Array<{ bundlePath: string }>;
		filters?: Record<string, string | string[]>;
		showEmptyFilters?: boolean;
	}

	export class PagefindUI {
		constructor(options: PagefindUIOptions);
	}
}
