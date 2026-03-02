import { describe, it, expect } from 'vitest';
import { searchDocs } from '../lib/search.js';
import type { DocsEntry } from '../lib/types.js';

function entry(overrides: Partial<DocsEntry> = {}): DocsEntry {
	return {
		sourcePath: 'test.mdx',
		title: '',
		description: '',
		category: 'guide',
		headings: [],
		keywords: [],
		snippet: '',
		...overrides,
	};
}

describe('searchDocs', () => {
	const entries: DocsEntry[] = [
		entry({ sourcePath: 'box.mdx', title: 'Box', keywords: ['layout'], category: 'core-components' }),
		entry({ sourcePath: 'flex.mdx', title: 'Flex', keywords: ['layout', 'flexbox'], category: 'core-components' }),
		entry({ sourcePath: 'accordion.mdx', title: 'Accordion', keywords: ['ui'], category: 'ui' }),
		entry({ sourcePath: 'spacing.mdx', title: 'Spacing', description: 'spacing tokens', category: 'guide' }),
	];

	it('空クエリは空配列を返す', () => {
		expect(searchDocs(entries, '')).toEqual([]);
	});

	it('タイトル一致で検索できる', () => {
		const results = searchDocs(entries, 'Accordion');
		expect(results.length).toBe(1);
		expect(results[0].heading).toBe('Accordion');
	});

	it('キーワード一致で検索できる', () => {
		const results = searchDocs(entries, 'layout');
		expect(results.length).toBe(2);
	});

	it('カテゴリフィルタが機能する', () => {
		const results = searchDocs(entries, 'layout', 'core-components');
		expect(results.length).toBe(2);

		const uiResults = searchDocs(entries, 'layout', 'ui');
		expect(uiResults.length).toBe(0);
	});

	it('category=allは全カテゴリを検索する', () => {
		const results = searchDocs(entries, 'layout', 'all');
		expect(results.length).toBe(2);
	});

	it('limit で結果件数を制限できる', () => {
		const results = searchDocs(entries, 'layout', undefined, 1);
		expect(results.length).toBe(1);
	});

	it('タイトル一致はキーワード一致より高スコア', () => {
		const testEntries: DocsEntry[] = [
			entry({ sourcePath: 'a.mdx', title: 'flex', keywords: [] }),
			entry({ sourcePath: 'b.mdx', title: 'other', keywords: ['flex'] }),
		];
		const results = searchDocs(testEntries, 'flex');
		expect(results[0].heading).toBe('flex');
	});

	it('URLが正しく生成される', () => {
		const results = searchDocs(entries, 'Box');
		expect(results[0].url).toBe('https://lism-css.com/ja/docs/box/');
	});

	it('マッチしない場合は空配列を返す', () => {
		expect(searchDocs(entries, 'nonexistent')).toEqual([]);
	});
});
