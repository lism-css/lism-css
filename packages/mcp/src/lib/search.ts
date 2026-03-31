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

// ".-g:5" or "-g:5" → prop="g", value="5" / "-p" → prop="p"
const PROP_CLASS_RE = /^\.?-([a-z][a-z0-9-]*)(:.+)?$/i;

/**
 * Prop Class 記法（例: "-g:5", ".-p:20", "-fz"）から prop 名を抽出する。
 * get-props-system.ts からも利用される共通ユーティリティ。
 */
export function parsePropClassName(input: string): string | null {
	const m = input.match(PROP_CLASS_RE);
	return m ? m[1].toLowerCase() : null;
}

/**
 * 検索クエリをCSSプロパティ名やProp Class記法で展開する。
 * 例: "font-size" → "font-size fz"
 * 例: "-g:5" → "-g:5 g gap prop class"
 */
function expandQuery(query: string, cssPropertyMap?: Map<string, string[]>): string {
	const additions: string[] = [];
	const queryLower = query.toLowerCase();
	const parsedProp = parsePropClassName(queryLower.trim());

	if (cssPropertyMap) {
		for (const [cssProp, lismProps] of cssPropertyMap) {
			// Prop Class 記法の逆引き（例: "-g:5" の "g" → "gap"）
			if (parsedProp && lismProps.includes(parsedProp)) {
				additions.push(cssProp);
			}
			// CSSプロパティ名の展開（例: "font-size" → "fz"）
			if (queryLower.includes(cssProp)) {
				additions.push(...lismProps);
			}
		}
	}

	if (parsedProp) {
		additions.push(parsedProp, 'prop class');
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

	// CSSプロパティ名・Prop Class記法をLism prop名に展開してからトークナイズ
	const expandedQuery = expandQuery(query, cssPropertyMap);
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
