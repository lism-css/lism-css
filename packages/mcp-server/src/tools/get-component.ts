import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';
import type { ComponentInfo } from '../lib/types.js';

export function registerGetComponent(server: McpServer): void {
	server.tool(
		'get_component',
		'Get detailed information about a specific lism-css component: props, usage examples, and category.',
		{
			name: z.string().describe('Component name to look up (e.g. "Box", "Flex", "Accordion").'),
			package: z
				.enum(['lism-css', '@lism-css/ui'])
				.optional()
				.describe('Filter by package. "lism-css" for core components, "@lism-css/ui" for UI components.'),
		},
		READ_ONLY_ANNOTATIONS,
		({ name, package: pkg }) => {
			try {
				const data = loadJSON<ComponentInfo[]>('components.json');

				let candidates = data;
				if (pkg) {
					candidates = data.filter((c) => c.package === pkg);
				}

				const nameLower = name.toLowerCase();
				const exact = candidates.find((c) => c.name.toLowerCase() === nameLower);

				if (exact) {
					return success({ component: exact });
				}

				const suggestions = candidates
					.filter((c) => c.name.toLowerCase().includes(nameLower))
					.map((c) => ({ name: c.name, package: c.package }));

				if (suggestions.length > 0) {
					return error(`Component "${name}" not found. Did you mean one of these?`, { suggestions });
				}

				const available = candidates.map((c) => ({ name: c.name, package: c.package }));
				return error(`Component "${name}" not found.`, { availableComponents: available });
			} catch (e) {
				return error(`Failed to load component data: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	);
}
