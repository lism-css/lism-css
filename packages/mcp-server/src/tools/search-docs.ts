import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { DocsEntrySchema } from '../lib/schemas.js';
import { searchDocs } from '../lib/search.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

const DOC_CATEGORIES = ['all', 'core-components', 'modules', 'props', 'ui', 'guide'] as const;

export function registerSearchDocs(server: McpServer): void {
	server.tool(
		'search_docs',
		'Search lism-css documentation by keyword. Returns matching pages with relevance scores.',
		{
			query: z.string().describe('Search query (keywords separated by spaces).'),
			category: z.enum(DOC_CATEGORIES).default('all').describe('Filter by documentation category.'),
			limit: z.number().int().min(1).max(20).default(10).describe('Maximum number of results to return.'),
		},
		READ_ONLY_ANNOTATIONS,
		({ query, category, limit }) => {
			try {
				const entries = loadJSON('docs-index.json', z.array(DocsEntrySchema));
				const results = searchDocs(entries, query, category, limit);
				return success({ query, results });
			} catch (e) {
				return error(`Failed to search docs: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	);
}
