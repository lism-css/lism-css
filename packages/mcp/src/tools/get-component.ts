import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { ComponentInfoSchema } from '../lib/schemas.js';
import { success, error, notFound, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

export function registerGetComponent(server: McpServer): void {
	server.registerTool(
		'get_component',
		{
			description:
				'特定のlism-cssコンポーネントに関する詳細情報（プロパティ、使用例、カテゴリー）を取得します。該当するものが見つからない場合は、より広範なキーワードで search_docs を実行してください。',
			inputSchema: {
				name: z.string().describe('Component name to look up (e.g. "Box", "Flex", "Accordion").'),
				package: z
					.enum(['lism-css', '@lism-css/ui'])
					.optional()
					.describe('Filter by package. "lism-css" for core components, "@lism-css/ui" for UI components.'),
			},
			annotations: READ_ONLY_ANNOTATIONS,
		},
		({ name, package: pkg }) => {
			try {
				const data = loadJSON('components.json', z.array(ComponentInfoSchema));

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
					return notFound(`Component "${name}" not found. Did you mean one of these? Or try search_docs with a broader query.`, {
						suggestions,
					});
				}

				const available = candidates.map((c) => ({ name: c.name, package: c.package }));
				return notFound(`Component "${name}" not found. Try search_docs to find related pages.`, { availableComponents: available });
			} catch (e) {
				return error(
					`Failed to load component data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Ensure the server was installed correctly.`
				);
			}
		}
	);
}
