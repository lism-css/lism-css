import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { TokenCategorySchema } from '../lib/schemas.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

const TOKEN_CATEGORIES = ['all', 'color', 'spacing', 'fontSize', 'shadow', 'radius', 'lineHeight', 'letterSpacing', 'fontFamily', 'zIndex'] as const;

export function registerGetTokens(server: McpServer): void {
	server.tool(
		'get_tokens',
		'Get design tokens (colors, spacing, font sizes, shadows, etc.) used in lism-css.',
		{
			category: z.enum(TOKEN_CATEGORIES).default('all').describe('Token category to retrieve. Use "all" to get all categories.'),
		},
		READ_ONLY_ANNOTATIONS,
		({ category }) => {
			try {
				const data = loadJSON('tokens.json', z.array(TokenCategorySchema));
				const filtered = category === 'all' ? data : data.filter((c) => c.category === category);
				return success({ tokens: filtered });
			} catch (e) {
				return error(`Failed to load tokens data: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	);
}
