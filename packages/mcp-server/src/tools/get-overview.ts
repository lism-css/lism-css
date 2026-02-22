import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { success } from '../lib/response.js';
import type { OverviewData } from '../lib/types.js';

export function registerGetOverview(server: McpServer): void {
	server.tool(
		'get_overview',
		'Get an overview of the lism-css framework: architecture, design philosophy, packages, breakpoints, installation guide, and CSS layers.',
		{},
		() => {
			const data = loadJSON<OverviewData>('overview.json');
			return success(data as unknown as Record<string, unknown>);
		}
	);
}
