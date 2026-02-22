import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGetOverview } from './tools/get-overview.js';
import { registerGetTokens } from './tools/get-tokens.js';
import { registerGetPropsSystem } from './tools/get-props-system.js';
import { registerGetComponent } from './tools/get-component.js';
import { registerSearchDocs } from './tools/search-docs.js';

async function main() {
	const server = new McpServer({
		name: 'lism-css',
		version: '0.1.0',
	});

	registerGetOverview(server);
	registerGetTokens(server);
	registerGetPropsSystem(server);
	registerGetComponent(server);
	registerSearchDocs(server);

	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((err) => {
	console.error('MCP server failed to start:', err);
	process.exit(1);
});
