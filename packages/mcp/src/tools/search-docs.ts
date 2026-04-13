import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { DocsEntrySchema } from '../lib/schemas.js';
import { parsePropRows } from '../lib/markdown-utils.js';
import { searchDocs } from '../lib/search.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

const DOC_CATEGORIES = ['all', 'core-components', 'primitives', 'props', 'ui', 'guide'] as const;

/**
 * property-class.md のテーブルから CSSプロパティ名 → Lism prop名 のマップを構築する。
 * search.ts の buildCssPropertyMap と同じインターフェースを返す。
 */
function buildCssPropertyMapFromMarkdown(md: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of parsePropRows(md)) {
    const normalized = row.cssProperty.toLowerCase();
    if (normalized.startsWith('(class:')) continue;
    const existing = map.get(normalized) ?? [];
    existing.push(row.prop.toLowerCase());
    map.set(normalized, existing);
  }
  return map;
}

export function registerSearchDocs(server: McpServer): void {
  server.registerTool(
    'search_docs',
    {
      description:
        "Search lism-css documentation by keyword. Returns matching pages with relevance scores. Supports CSS property names (e.g. 'font-size', 'padding') which are automatically expanded to corresponding lism prop names.\n" +
        'Use this when you cannot find information with other tools, or to discover available components, features, and guides by keyword.\n' +
        'Do NOT use this as your first step — prefer get_component for a known component, get_props_system for a known prop, or get_guide for a specific topic. This is a fallback search tool.\n' +
        'Returns JSON with search results including page URLs and relevance scores.',
      inputSchema: {
        query: z.string().describe('Search query (keywords separated by spaces). CSS property names like "font-size" are also accepted.'),
        category: z.enum(DOC_CATEGORIES).default('all').describe('Filter by documentation category.'),
        limit: z.number().int().min(1).max(20).default(10).describe('Maximum number of results to return.'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ query, category, limit }) => {
      try {
        const entries = loadJSON('docs-index.json', z.array(DocsEntrySchema));
        const cssPropertyMap = buildCssPropertyMapFromMarkdown(loadMarkdown('property-class.md'));
        const results = searchDocs(entries, query, { category, limit, cssPropertyMap });
        return success({ query, results });
      } catch (e) {
        return error(
          `Failed to search docs: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
