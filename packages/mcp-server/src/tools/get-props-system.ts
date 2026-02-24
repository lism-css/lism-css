import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { PropsSystemDataSchema } from '../lib/schemas.js';
import { success, error, notFound, READ_ONLY_ANNOTATIONS } from '../lib/response.js';
import type { PropCategory } from '../lib/types.js';

export function registerGetPropsSystem(server: McpServer): void {
	server.tool(
		'get_props_system',
		'Get the lism-css Props system reference: how React props map to CSS classes and styles. Optionally filter by a specific prop name. Related: use get_component to see how props are used in specific components.',
		{
			prop: z.string().optional().describe('Specific prop name to look up (e.g. "p", "fz", "bgc"). Omit to get the full system overview.'),
		},
		READ_ONLY_ANNOTATIONS,
		({ prop }) => {
			try {
				const data = loadJSON('props-system.json', PropsSystemDataSchema);

				if (!prop) {
					return success(data as unknown as Record<string, unknown>);
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
					const allProps = data.categories.flatMap((c) => c.props.map((p) => p.prop));
					return notFound(`Prop "${prop}" not found. Try search_docs to find related documentation.`, { availableProps: allProps });
				}

				return success({ description: data.description, categories: matched });
			} catch (e) {
				return error(
					`Failed to load props system data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Ensure the server was installed correctly.`
				);
			}
		}
	);
}
