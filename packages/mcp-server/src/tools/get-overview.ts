import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';
import type { OverviewData } from '../lib/types.js';

export function registerGetOverview(server: McpServer): void {
	server.tool(
		'get_overview',
		'Get an overview of the lism-css framework: architecture, design philosophy, packages, breakpoints, installation guide, and CSS layers.',
		{},
		READ_ONLY_ANNOTATIONS,
		() => {
			try {
				const data = loadJSON<OverviewData>('overview.json');
				return success(data as unknown as Record<string, unknown>);
			} catch (e) {
				return error(`Failed to load overview data: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	);
}
