import type { MarkdownHeading } from 'astro';

export interface TocItem extends MarkdownHeading {
	children: TocItem[];
}

export const PAGE_TITLE_ID = '';
const PAGE_TOP_TITLE = 'Top';
const MIN_H_LEVEL = 2;
const MAX_H_LEVEL = 3;

export function generateToc(headings: MarkdownHeading[]): TocItem[] {
	const filtered = headings.filter((h) => h.depth >= MIN_H_LEVEL && h.depth <= MAX_H_LEVEL);

	// 冒頭へのリンク（h2と同じ階層に配置）
	const root: TocItem = {
		depth: MIN_H_LEVEL,
		slug: PAGE_TITLE_ID,
		text: PAGE_TOP_TITLE,
		children: [],
	};

	const toc: TocItem[] = [root];
	const stack: TocItem[] = [root];

	for (const heading of filtered) {
		const item: TocItem = { ...heading, children: [] };

		while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
			stack.pop();
		}

		if (stack.length === 0) {
			toc.push(item);
		} else {
			stack[stack.length - 1].children.push(item);
		}

		stack.push(item);
	}

	return toc;
}
