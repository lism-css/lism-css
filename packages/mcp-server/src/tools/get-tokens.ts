import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { success } from '../lib/response.js';
import type { TokenCategory } from '../lib/types.js';

const TOKEN_CATEGORIES = ['all', 'color', 'spacing', 'fontSize', 'shadow', 'radius', 'lineHeight', 'letterSpacing', 'fontFamily', 'zIndex'] as const;

export function registerGetTokens(server: McpServer): void {
	server.tool(
		'get_tokens',
		'Get design tokens (colors, spacing, font sizes, shadows, etc.) used in lism-css.',
		{
			category: z.enum(TOKEN_CATEGORIES).default('all').describe('Token category to retrieve. Use "all" to get all categories.'),
		},
		({ category }) => {
			const data = loadJSON<TokenCategory[]>('tokens.json');
			const filtered = category === 'all' ? data : data.filter((c) => c.category === category);
			return success({ tokens: filtered });
		}
	);
}
