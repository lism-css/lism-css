import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { meta } from '../data/meta.js';
import type { PropsSystemData, PropCategory } from '../lib/types.js';

export function registerGetPropsSystem(server: McpServer): void {
	server.tool(
		'get_props_system',
		'Get the lism-css Props system reference: how React props map to CSS classes and styles. Optionally filter by a specific prop name.',
		{
			prop: z.string().optional().describe('Specific prop name to look up (e.g. "p", "fz", "bgc"). Omit to get the full system overview.'),
		},
		({ prop }) => {
			const data = loadJSON<PropsSystemData>('props-system.json');

			if (!prop) {
				return {
					content: [
						{
							type: 'text' as const,
							text: JSON.stringify({ meta, ...data }, null, 2),
						},
					],
				};
			}

			const propLower = prop.toLowerCase();
			const matched: PropCategory[] = [];

			for (const cat of data.categories) {
				const found = cat.props.filter((p) => p.prop.toLowerCase() === propLower);
				if (found.length > 0) {
					matched.push({ ...cat, props: found });
				}
			}

			if (matched.length === 0) {
				// Show all available prop names as suggestions
				const allProps = data.categories.flatMap((c) => c.props.map((p) => p.prop));
				return {
					content: [
						{
							type: 'text' as const,
							text: JSON.stringify(
								{
									meta,
									error: `Prop "${prop}" not found.`,
									availableProps: allProps,
								},
								null,
								2
							),
						},
					],
				};
			}

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								meta,
								description: data.description,
								categories: matched,
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
