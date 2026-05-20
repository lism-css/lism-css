import type { MarkdownHeading } from 'astro';

export interface TocItem extends MarkdownHeading {
  children: TocItem[];
}

const MIN_LEVEL = 2;
const MAX_LEVEL = 3;

/**
 * 記事の見出し配列から階層構造のTOCを生成する。
 * h2/h3 のみを対象とし、h3 は直前の h2 の children に格納する。
 */
export function generateToc(headings: MarkdownHeading[]): TocItem[] {
  const filtered = headings.filter((h) => h.depth >= MIN_LEVEL && h.depth <= MAX_LEVEL);

  const toc: TocItem[] = [];
  const stack: TocItem[] = [];

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
