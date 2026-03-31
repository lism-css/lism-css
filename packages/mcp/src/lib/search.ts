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
 * Prop Class 記法（例: "-g:5", ".-p:20"）からprop名を抽出する。
 * マッチしなければ null を返す。
 */
function parsePropClassNotation(token: string): { prop: string; value: string } | null {
	// ".-g:5" or "-g:5" → prop="g", value="5"
	const match = token.match(/^\.?-([a-z][a-z0-9-]*):(.+)$/i);
	if (!match) return null;
	return { prop: match[1].toLowerCase(), value: match[2] };
}

/**
 * 検索クエリをCSSプロパティ名やProp Class記法で展開する。
 * 例: "font-size" → "font-size fz"
 * 例: "-g:5" → "-g:5 g gap prop class"
 */
function expandQuery(query: string, cssPropertyMap?: Map<string, string[]>): string {
	const additions: string[] = [];

	// Prop Class 記法の展開（例: "-g:5" → "g", "gap"）
	const queryLower = query.toLowerCase();
	const parsed = parsePropClassNotation(queryLower.trim());
	if (parsed) {
		additions.push(parsed.prop);
		// prop名から逆引きでCSSプロパティ名も追加
		if (cssPropertyMap) {
			for (const [cssProp, lismProps] of cssPropertyMap) {
				if (lismProps.includes(parsed.prop)) {
					additions.push(cssProp);
				}
			}
		}
		// Prop Class 関連のキーワードを追加してページヒット率を上げる
		additions.push('prop class');
	}

	// CSSプロパティ名の展開
	if (cssPropertyMap) {
		for (const [cssProp, lismProps] of cssPropertyMap) {
			if (queryLower.includes(cssProp)) {
				additions.push(...lismProps);
			}
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
