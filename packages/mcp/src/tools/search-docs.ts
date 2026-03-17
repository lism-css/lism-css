import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { DocsEntrySchema, ComponentInfoSchema, PropsSystemDataSchema } from '../lib/schemas.js';
import { buildAliasMap, buildCssPropertyMap, searchDocs } from '../lib/search.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

const DOC_CATEGORIES = ['all', 'core-components', 'modules', 'props', 'ui', 'guide'] as const;

export function registerSearchDocs(server: McpServer): void {
	server.registerTool(
		'search_docs',
		{
			description:
				"Search lism-css documentation by keyword. Returns matching pages with relevance scores. Supports CSS property names (e.g. 'font-size', 'padding') which are automatically expanded to corresponding lism prop names. Use this when other tools don't return the information you need, or to discover available components and features.",
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
				const components = loadJSON('components.json', z.array(ComponentInfoSchema));
				const propsData = loadJSON('props-system.json', PropsSystemDataSchema);
				const aliasMap = buildAliasMap(components);
				const cssPropertyMap = buildCssPropertyMap(propsData.categories);
				const results = searchDocs(entries, query, { category, limit, aliasMap, cssPropertyMap });
				return success({ query, results });
			} catch (e) {
				return error(
					`Failed to search docs: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Ensure the server was installed correctly.`
				);
			}
		}
	);
}
