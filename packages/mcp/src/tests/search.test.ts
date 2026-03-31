import { describe, it, expect } from 'vitest';
import { buildAliasMap, buildCssPropertyMap, searchDocs } from '../lib/search.js';
import type { DocsEntry, PropCategory } from '../lib/types.js';

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
		const results = searchDocs(entries, 'layout', { category: 'core-components' });
		expect(results.length).toBe(2);

		const uiResults = searchDocs(entries, 'layout', { category: 'ui' });
		expect(uiResults.length).toBe(0);
	});

	it('category=allは全カテゴリを検索する', () => {
		const results = searchDocs(entries, 'layout', { category: 'all' });
		expect(results.length).toBe(2);
	});

	it('limit で結果件数を制限できる', () => {
		const results = searchDocs(entries, 'layout', { limit: 1 });
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
		expect(results[0].url).toBe('https://lism-css.com/docs/box/');
	});

	it('マッチしない場合は空配列を返す', () => {
		expect(searchDocs(entries, 'nonexistent')).toEqual([]);
	});
});

describe('searchDocs with aliases', () => {
	const docsEntries: DocsEntry[] = [
		entry({
			sourcePath: 'modules/l--fluidcols.mdx',
			title: 'FluidCols / l--fluidCols',
			keywords: ['FluidCols', 'fluid', 'auto-fill'],
			snippet: '子要素が最小幅に達すると自動的に折り返すグリッドレイアウト。メディアクエリに依存しない。',
			category: 'modules',
		}),
		entry({
			sourcePath: 'modules/l--grid.mdx',
			title: 'Grid / l--grid',
			keywords: ['Grid', 'グリッド', 'CSS Grid'],
			snippet: 'CSS Gridレイアウトを構成。',
			category: 'modules',
		}),
		entry({
			sourcePath: 'modules/l--cluster.mdx',
			title: 'Cluster / l--cluster',
			keywords: ['Cluster', 'wrap'],
			snippet: '横方向に要素を並べ、自動的に折り返すFlexレイアウト。',
			category: 'modules',
		}),
	];

	const aliasMap = buildAliasMap([
		{ name: 'FluidCols', aliases: ['auto-wrap', '自動折り返し', 'responsive grid', 'メディアクエリなし', 'fluid columns'] },
		{ name: 'Grid', aliases: ['CSS Grid', 'グリッド'] },
		{ name: 'Cluster', aliases: ['横並び折り返し', 'flex wrap'] },
	]);

	it('aliases がスコアリングに反映される', () => {
		const results = searchDocs(docsEntries, '自動折り返し', { aliasMap });
		expect(results.length).toBeGreaterThan(0);
		// FluidCols が aliases マッチで上位に出る
		expect(results[0].heading).toBe('FluidCols / l--fluidCols');
	});

	it('「メディアクエリなし」で FluidCols がヒットする', () => {
		const results = searchDocs(docsEntries, 'メディアクエリなし', { aliasMap });
		const fluidColsResult = results.find((r) => r.heading.includes('FluidCols'));
		expect(fluidColsResult).toBeDefined();
		expect(fluidColsResult!.score).toBeGreaterThan(0);
	});

	it('aliases なしの場合も従来通り動作する', () => {
		const results = searchDocs(docsEntries, 'Grid');
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].heading).toBe('Grid / l--grid');
	});

	it('aliases ブーストにより aliases なしより高スコアになる', () => {
		const withAliases = searchDocs(docsEntries, '自動折り返し', { aliasMap });
		const withoutAliases = searchDocs(docsEntries, '自動折り返し');

		const scoreWith = withAliases.find((r) => r.heading.includes('FluidCols'))?.score ?? 0;
		const scoreWithout = withoutAliases.find((r) => r.heading.includes('FluidCols'))?.score ?? 0;

		expect(scoreWith).toBeGreaterThan(scoreWithout);
	});
});

describe('searchDocs with Prop Class notation', () => {
	const propClassEntries: DocsEntry[] = [
		entry({
			sourcePath: 'prop-class.mdx',
			title: 'Prop Class',
			keywords: ['prop class', '-g:', '-g:5', '-p:', '-p:20', 'gap', 'padding'],
			snippet: '-{prop}:{value} の形式（例: -g:5, -p:20, -fz:l）。',
			category: 'props',
		}),
		entry({
			sourcePath: 'modules/l--grid.mdx',
			title: 'Grid / l--grid',
			keywords: ['Grid', 'グリッド'],
			snippet: 'CSS Gridレイアウト。',
			category: 'modules',
		}),
		entry({
			sourcePath: 'tokens.mdx',
			title: 'Design Tokens',
			keywords: ['spacing', 'gap'],
			category: 'guide',
		}),
	];

	const cssPropertyMap = buildCssPropertyMap([
		{
			category: 'spacing',
			description: '',
			props: [
				{ prop: 'g', cssProperty: 'gap', type: 'string', responsive: true, description: '', values: ['5', '10', '20'] },
				{ prop: 'p', cssProperty: 'padding', type: 'string', responsive: true, description: '', values: ['20', '30'] },
			],
		},
	] satisfies PropCategory[]);

	it('"-g:5" で Prop Class ページがヒットする', () => {
		const results = searchDocs(propClassEntries, '-g:5', { cssPropertyMap });
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].heading).toBe('Prop Class');
	});

	it('".-p:20" で Prop Class ページがヒットする', () => {
		const results = searchDocs(propClassEntries, '.-p:20', { cssPropertyMap });
		expect(results.length).toBeGreaterThan(0);
		const propClassResult = results.find((r) => r.heading === 'Prop Class');
		expect(propClassResult).toBeDefined();
	});

	it('"gap" で Prop Class ページと Tokens ページがヒットする', () => {
		const results = searchDocs(propClassEntries, 'gap', { cssPropertyMap });
		expect(results.length).toBeGreaterThanOrEqual(2);
		const titles = results.map((r) => r.heading);
		expect(titles).toContain('Prop Class');
	});

	it('Prop Class 記法でないクエリには影響しない', () => {
		const results = searchDocs(propClassEntries, 'Grid', { cssPropertyMap });
		expect(results[0].heading).toBe('Grid / l--grid');
	});
});
