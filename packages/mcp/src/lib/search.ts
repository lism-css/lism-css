import type { DocsEntry, PropCategory, SearchResult } from './types.js';

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[\s\-_./]+/)
		.filter((t) => t.length > 0);
}

/**
 * コンポーネント名 → aliases (lowercase) のマップを構築。
 * ComponentInfo に限らず { name, aliases? } を持つ任意の配列から生成できる。
 */
export function buildAliasMap(items: Array<{ name: string; aliases?: string[] }>): Map<string, string[]> {
	const map = new Map<string, string[]>();
	for (const item of items) {
		if (item.aliases && item.aliases.length > 0) {
			map.set(
				item.name.toLowerCase(),
				item.aliases.map((a) => a.toLowerCase())
			);
		}
	}
	return map;
}

/**
 * CSSプロパティ名 → Lism prop名のマップを構築。
 * 検索クエリにCSSプロパティ名が含まれていた場合に、対応するLism prop名で展開するために使用。
 */
export function buildCssPropertyMap(categories: PropCategory[]): Map<string, string[]> {
	const map = new Map<string, string[]>();
	for (const cat of categories) {
		for (const p of cat.props) {
			// "(class: ...)" はスキップ
			if (p.cssProperty.startsWith('(class:')) continue;

			// "--hl (CSS変数)" → "--hl"
			const normalized = p.cssProperty
				.replace(/\s*\(.*\)$/, '')
				.trim()
				.toLowerCase();
			if (!normalized) continue;

			const existing = map.get(normalized) ?? [];
			existing.push(p.prop.toLowerCase());
			map.set(normalized, existing);
		}
	}
	return map;
}

/**
 * 検索クエリをCSSプロパティ名で展開する。
 * 例: "font-size" → "font-size fz", "padding" → "padding p"
 */
function expandQueryWithCssProps(query: string, cssPropertyMap?: Map<string, string[]>): string {
	if (!cssPropertyMap) return query;

	const queryLower = query.toLowerCase();
	const additions: string[] = [];

	for (const [cssProp, lismProps] of cssPropertyMap) {
		if (queryLower.includes(cssProp)) {
			additions.push(...lismProps);
		}
	}

	return additions.length > 0 ? `${query} ${additions.join(' ')}` : query;
}

// docs entry のタイトルに含まれるコンポーネント名から aliases を取得
function getEntryAliases(entry: DocsEntry, aliasMap: Map<string, string[]>): string[] {
	const titleLower = entry.title.toLowerCase();
	for (const [name, aliases] of aliasMap) {
		if (titleLower.includes(name)) {
			return aliases;
		}
	}
	return [];
}

function scoreEntry(entry: DocsEntry, queryTokens: string[], aliasMap?: Map<string, string[]>): number {
	let score = 0;
	const titleLower = entry.title.toLowerCase();
	const descLower = entry.description.toLowerCase();
	const headingsLower = entry.headings.join(' ').toLowerCase();
	const keywordsLower = entry.keywords.join(' ').toLowerCase();
	const snippetLower = entry.snippet.toLowerCase();

	for (const token of queryTokens) {
		// title matches are weighted highest
		if (titleLower.includes(token)) score += 10;
		// keywords
		if (keywordsLower.includes(token)) score += 5;
		// headings
		if (headingsLower.includes(token)) score += 3;
		// description
		if (descLower.includes(token)) score += 2;
		// snippet
		if (snippetLower.includes(token)) score += 1;
	}

	// コンポーネントの aliases によるブースト
	if (aliasMap) {
		const aliases = getEntryAliases(entry, aliasMap);
		if (aliases.length > 0) {
			const aliasesStr = aliases.join(' ');
			for (const token of queryTokens) {
				if (aliasesStr.includes(token)) score += 5;
			}
		}
	}

	return score;
}

export interface SearchDocsOptions {
	category?: string;
	limit?: number;
	aliasMap?: Map<string, string[]>;
	cssPropertyMap?: Map<string, string[]>;
}

export function searchDocs(entries: DocsEntry[], query: string, options?: SearchDocsOptions): SearchResult[] {
	const { category, limit = 10, aliasMap, cssPropertyMap } = options ?? {};

	// CSSプロパティ名をLism prop名に展開してからトークナイズ
	const expandedQuery = expandQueryWithCssProps(query, cssPropertyMap);
	const queryTokens = tokenize(expandedQuery);
	if (queryTokens.length === 0) return [];

	let filtered = entries;
	if (category && category !== 'all') {
		filtered = entries.filter((e) => e.category === category);
	}

	const scored = filtered
		.map((entry) => {
			const score = scoreEntry(entry, queryTokens, aliasMap);
			return { entry, score };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);

	const DOCS_BASE_URL = 'https://lism-css.com/docs';

	return scored.map(({ entry, score }) => ({
		sourcePath: entry.sourcePath,
		url: `${DOCS_BASE_URL}/${entry.sourcePath.replace(/\.mdx$/, '')}/`,
		heading: entry.title,
		snippet: entry.snippet,
		score,
	}));
}
