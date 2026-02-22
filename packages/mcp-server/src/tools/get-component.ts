import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { meta } from '../data/meta.js';
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
		({ name, package: pkg }) => {
			const data = loadJSON<ComponentInfo[]>('components.json');

			let candidates = data;
			if (pkg) {
				candidates = data.filter((c) => c.package === pkg);
			}

			// Exact match (case-insensitive)
			const nameLower = name.toLowerCase();
			const exact = candidates.find((c) => c.name.toLowerCase() === nameLower);

			if (exact) {
				return {
					content: [
						{
							type: 'text' as const,
							text: JSON.stringify({ meta, component: exact }, null, 2),
						},
					],
				};
			}

			// Partial match for suggestions
			const suggestions = candidates.filter((c) => c.name.toLowerCase().includes(nameLower)).map((c) => ({ name: c.name, package: c.package }));

			if (suggestions.length > 0) {
				return {
					content: [
						{
							type: 'text' as const,
							text: JSON.stringify(
								{
									meta,
									error: `Component "${name}" not found. Did you mean one of these?`,
									suggestions,
								},
								null,
								2
							),
						},
					],
				};
			}

			// No match at all — list all available
			const available = candidates.map((c) => ({
				name: c.name,
				package: c.package,
			}));
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								meta,
								error: `Component "${name}" not found.`,
								availableComponents: available,
							},
							null,
							2
						),
					},
				],
			};
		}
	);
}
