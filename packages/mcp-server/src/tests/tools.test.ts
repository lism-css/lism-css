import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerGetOverview } from '../tools/get-overview.js';
import { registerGetTokens } from '../tools/get-tokens.js';
import { registerGetPropsSystem } from '../tools/get-props-system.js';
import { registerGetComponent } from '../tools/get-component.js';
import { registerSearchDocs } from '../tools/search-docs.js';

async function createTestClient() {
	const server = new McpServer({ name: 'test', version: '0.0.1' });
	registerGetOverview(server);
	registerGetTokens(server);
	registerGetPropsSystem(server);
	registerGetComponent(server);
	registerSearchDocs(server);

	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
	await server.connect(serverTransport);

	const client = new Client({ name: 'test-client', version: '0.0.1' });
	await client.connect(clientTransport);

	return client;
}

describe('MCP Tools (integration)', () => {
	it('get_overview が正常にMarkdownデータを返す', async () => {
		const client = await createTestClient();
		const result = await client.callTool({ name: 'get_overview', arguments: {} });
		expect(result.content).toBeDefined();
		expect(result.isError).toBeFalsy();

		const text = (result.content as { type: string; text: string }[])[0].text;
		expect(text).toContain('# lism-css Overview');
		expect(text).toContain('## Description');
		expect(text).toContain('## Architecture');
		expect(text).toContain('## Packages');
	});

	it('get_tokens が正常にデータを返す', async () => {
		const client = await createTestClient();
		const result = await client.callTool({ name: 'get_tokens', arguments: { category: 'color' } });
		expect(result.isError).toBeFalsy();

		const text = (result.content as { type: string; text: string }[])[0].text;
		const data = JSON.parse(text);
		expect(data.tokens).toBeDefined();
	});

	it('get_props_system が正常にデータを返す', async () => {
		const client = await createTestClient();
		const result = await client.callTool({ name: 'get_props_system', arguments: {} });
		expect(result.isError).toBeFalsy();

		const text = (result.content as { type: string; text: string }[])[0].text;
		const data = JSON.parse(text);
		expect(data.categories).toBeDefined();
	});

	it('get_props_system で存在しないpropを検索すると代替提案付きの正常レスポンスを返す', async () => {
		const client = await createTestClient();
		const result = await client.callTool({ name: 'get_props_system', arguments: { prop: 'nonexistent_prop_xyz' } });
		expect(result.isError).toBeFalsy();

		const text = (result.content as { type: string; text: string }[])[0].text;
		const data = JSON.parse(text);
		expect(data.error).toContain('not found');
		expect(data.error).toContain('search_docs');
		expect(data.availableProps).toBeDefined();
	});

	it('get_component で存在しないコンポーネントを検索すると代替提案付きの正常レスポンスを返す', async () => {
		const client = await createTestClient();
		const result = await client.callTool({ name: 'get_component', arguments: { name: 'NonExistentComponent999' } });
		expect(result.isError).toBeFalsy();

		const text = (result.content as { type: string; text: string }[])[0].text;
		const data = JSON.parse(text);
		expect(data.error).toContain('not found');
		expect(data.error).toContain('search_docs');
	});

	it('search_docs が正常にデータを返す', async () => {
		const client = await createTestClient();
		const result = await client.callTool({ name: 'search_docs', arguments: { query: 'Box' } });
		expect(result.isError).toBeFalsy();

		const text = (result.content as { type: string; text: string }[])[0].text;
		const data = JSON.parse(text);
		expect(data.query).toBe('Box');
		expect(data.results).toBeDefined();
	});

	it('ツール一覧が5つ登録されている', async () => {
		const client = await createTestClient();
		const tools = await client.listTools();
		expect(tools.tools.length).toBe(5);
	});

	it('全ツールにreadOnlyHintアノテーションがある', async () => {
		const client = await createTestClient();
		const tools = await client.listTools();
		for (const tool of tools.tools) {
			expect(tool.annotations?.readOnlyHint).toBe(true);
		}
	});
});
