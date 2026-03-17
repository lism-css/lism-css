import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { DocsEntrySchema, ComponentInfoSchema } from '../lib/schemas.js';
import { buildAliasMap, searchDocs } from '../lib/search.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

const DOC_CATEGORIES = ['all', 'core-components', 'modules', 'props', 'ui', 'guide'] as const;

export function registerSearchDocs(server: McpServer): void {
	server.registerTool(
		'search_docs',
		{
			description:
				"Search lism-css documentation by keyword. Returns matching pages with relevance scores. Use this when other tools don't return the information you need, or to discover available components and features.",
			inputSchema: {
				query: z.string().describe('Search query (keywords separated by spaces).'),
				category: z.enum(DOC_CATEGORIES).default('all').describe('Filter by documentation category.'),
				limit: z.number().int().min(1).max(20).default(10).describe('Maximum number of results to return.'),
			},
			annotations: READ_ONLY_ANNOTATIONS,
		},
		({ query, category, limit }) => {
			try {
				const entries = loadJSON('docs-index.json', z.array(DocsEntrySchema));
				const components = loadJSON('components.json', z.array(ComponentInfoSchema));
				const aliasMap = buildAliasMap(components);
				const results = searchDocs(entries, query, { category, limit, aliasMap });
				return success({ query, results });
			} catch (e) {
				return error(
					`Failed to search docs: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Ensure the server was installed correctly.`
				);
			}
		}
	);
}
