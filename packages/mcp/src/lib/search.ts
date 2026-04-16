import type { DocsEntry, SearchResult } from './types.js';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-_./]+/)
    .filter((t) => t.length > 0);
}

// ".-g:5" or "-g:5" → prop="g", value="5" / "-p" → prop="p"
const PROP_CLASS_RE = /^\.?-([a-z][a-z0-9-]*)(:.+)?$/i;

/**
 * Property Class 記法（例: "-g:5", ".-p:20", "-fz"）から prop 名を抽出する。
 * get-props-system.ts からも利用される共通ユーティリティ。
 */
export function parsePropClassName(input: string): string | null {
  const m = input.match(PROP_CLASS_RE);
  return m ? m[1].toLowerCase() : null;
}

/**
 * 検索クエリをCSSプロパティ名やProperty Class記法で展開する。
 * 例: "font-size" → "font-size fz"
 * 例: "-g:5" → "-g:5 g gap property class"
 */
function expandQuery(query: string, cssPropertyMap?: Map<string, string[]>): string {
  const additions: string[] = [];
  const queryLower = query.toLowerCase();
  const parsedProp = parsePropClassName(queryLower.trim());

  if (cssPropertyMap) {
    for (const [cssProp, lismProps] of cssPropertyMap) {
      // Property Class 記法の逆引き（例: "-g:5" の "g" → "gap"）
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
    additions.push(parsedProp, 'property class');
  }

  return additions.length > 0 ? `${query} ${additions.join(' ')}` : query;
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

export interface SearchDocsOptions {
  category?: string;
  limit?: number;
  cssPropertyMap?: Map<string, string[]>;
}

export function searchDocs(entries: DocsEntry[], query: string, options?: SearchDocsOptions): SearchResult[] {
  const { category, limit = 10, cssPropertyMap } = options ?? {};

  // CSSプロパティ名・Property Class記法をLism prop名に展開してからトークナイズ
  const expandedQuery = expandQuery(query, cssPropertyMap);
  const queryTokens = tokenize(expandedQuery);
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

  const DOCS_BASE_URL = 'https://lism-css.com/docs';

  return scored.map(({ entry, score }) => ({
    sourcePath: entry.sourcePath,
    url: `${DOCS_BASE_URL}/${sourcePathToUrlSlug(entry.sourcePath)}/`,
    heading: entry.title,
    snippet: entry.snippet,
    score,
  }));
}

/**
 * `sourcePath`（実 MDX ファイルの相対パス）を公開 URL のスラッグに変換する。
 *
 * - `primitives/` 配下のみファイル名の casing を保持（CSS クラス名と URL を一致させるための例外）
 * - それ以外は全て小文字化（Astro content collections の `generateId` と揃える）
 *
 * IMPORTANT: `apps/docs/src/lib/contentSlug.ts` の `toContentSlug` と必ず同じロジックに保つこと。
 * 別ワークスペース（apps/docs）なので直接 import できず、ローカル実装で複製している。
 * apps/docs 側を変更した場合は必ずここも合わせて更新する。
 *
 * 例:
 *   `primitives/l--tileGrid.mdx`   → `primitives/l--tileGrid`
 *   `core-components/Group.mdx`    → `core-components/group`
 *   `ui/DummyText.mdx`             → `ui/dummytext`
 */
function sourcePathToUrlSlug(sourcePath: string): string {
  const withoutExt = sourcePath.replace(/\.mdx$/, '');
  return withoutExt.startsWith('primitives/') ? withoutExt : withoutExt.toLowerCase();
}
