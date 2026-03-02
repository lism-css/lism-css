import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { OverviewDataSchema } from '../lib/schemas.js';
import { markdownResponse, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';
import { meta } from '../data/meta.js';
import type { z } from 'zod';

function toMarkdown(data: z.infer<typeof OverviewDataSchema>): string {
	const lines: string[] = [];

	lines.push(`# lism-css Overview`);
	lines.push('');
	lines.push(`> Generated at: ${meta.generatedAt} | Source commit: ${meta.sourceCommit} | Docs version: ${meta.docsVersion}`);
	lines.push('');
	lines.push(`## Description`);
	lines.push('');
	lines.push(data.description);
	lines.push('');
	lines.push(`## Architecture`);
	lines.push('');
	lines.push(data.architecture);
	lines.push('');
	lines.push(`## Packages`);
	lines.push('');
	for (const pkg of data.packages) {
		lines.push(`- **${pkg.name}** (\`${pkg.npmName}\` v${pkg.version}): ${pkg.description}`);
	}
	lines.push('');
	lines.push(`## Breakpoints`);
	lines.push('');
	for (const [key, value] of Object.entries(data.breakpoints)) {
		lines.push(`- \`${key}\`: ${value}`);
	}
	lines.push('');
	lines.push(`## CSS Layers`);
	lines.push('');
	lines.push(data.cssLayers);
	lines.push('');
	lines.push(`## Installation`);
	lines.push('');
	lines.push(data.installation);

	return lines.join('\n');
}

export function registerGetOverview(server: McpServer): void {
	server.tool(
		'get_overview',
		'Get an overview of the lism-css framework: architecture, design philosophy, packages, breakpoints, installation guide, and CSS layers. Start here to understand the framework before using other tools.',
		{},
		READ_ONLY_ANNOTATIONS,
		() => {
			try {
				const data = loadJSON('overview.json', OverviewDataSchema);
				return markdownResponse(toMarkdown(data));
			} catch (e) {
				return error(
					`Failed to load overview data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Ensure the server was installed correctly.`
				);
			}
		}
	);
}
