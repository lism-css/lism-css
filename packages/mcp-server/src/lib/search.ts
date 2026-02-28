import type { DocsEntry, SearchResult } from './types.js';

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[\s\-_./]+/)
		.filter((t) => t.length > 0);
}

function scoreEntry(entry: DocsEntry, queryTokens: string[]): number {
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

	return score;
}

export function searchDocs(entries: DocsEntry[], query: string, category?: string, limit: number = 10): SearchResult[] {
	const queryTokens = tokenize(query);
	if (queryTokens.length === 0) return [];

	let filtered = entries;
	if (category && category !== 'all') {
		filtered = entries.filter((e) => e.category === category);
	}

	const scored = filtered
		.map((entry) => {
			const score = scoreEntry(entry, queryTokens);
			return { entry, score };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);

	const DOCS_BASE_URL = 'https://lism-css.com/ja/docs';

	return scored.map(({ entry, score }) => ({
		sourcePath: entry.sourcePath,
		url: `${DOCS_BASE_URL}/${entry.sourcePath.replace(/\.mdx$/, '')}/`,
		heading: entry.title,
		snippet: entry.snippet,
		score,
	}));
}
