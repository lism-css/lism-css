import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerGetOverview } from '../tools/get-overview.js';
import { registerGetTokens } from '../tools/get-tokens.js';
import { registerGetPropsSystem } from '../tools/get-props-system.js';
import { registerGetComponent } from '../tools/get-component.js';
import { registerGetGuide } from '../tools/get-guide.js';
import { registerSearchDocs } from '../tools/search-docs.js';
import { registerConvertCss } from '../tools/convert-css.js';

async function createTestClient() {
  const server = new McpServer({ name: 'test', version: '0.0.1' });
  registerGetOverview(server);
  registerGetTokens(server);
  registerGetPropsSystem(server);
  registerGetComponent(server);
  registerGetGuide(server);
  registerSearchDocs(server);
  registerConvertCss(server);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({ name: 'test-client', version: '0.0.1' });
  await client.connect(clientTransport);

  return client;
}

function getText(result: Awaited<ReturnType<Client['callTool']>>): string {
  return (result.content as { type: string; text: string }[])[0].text;
}

describe('MCP Tools (integration)', () => {
  it('get_overview が Markdown を返す（SKILL.md ベース）', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_overview', arguments: {} });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('Lism CSS');
    expect(text).toContain('lism-css');
  });

  it('get_tokens が Markdown を返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_tokens', arguments: {} });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('デザイントークン');
  });

  it('get_props_system（引数なし）が property-class.md の Markdown を返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_props_system', arguments: {} });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('Property Class');
    expect(text).toContain('Prop');
  });

  it('get_props_system で "-g:5" を渡すと gap に関する Markdown が返る', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_props_system', arguments: { prop: '-g:5' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('gap');
    expect(text).toContain('`g`');
  });

  it('get_props_system で "padding" を渡すと p prop に関する Markdown が返る', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_props_system', arguments: { prop: 'padding' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('padding');
    expect(text).toContain('`p`');
  });

  it('get_props_system で存在しないpropを検索すると代替提案付きの正常レスポンスを返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_props_system', arguments: { prop: 'nonexistent_prop_xyz' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    const data = JSON.parse(text);
    expect(data.error).toContain('見つかりません');
    expect(data.availableProps).toBeDefined();
  });

  it('get_component で Accordion を検索すると該当セクションの Markdown が返る', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'Accordion' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('Accordion');
  });

  it('get_component で Flex を検索すると該当セクションの Markdown が返る', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'Flex' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('Flex');
  });

  it('get_component で Lism を検索すると該当セクションの Markdown が返る', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'Lism' } });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain('Lism');
  });

  it('get_component で HTML を検索すると該当セクションの Markdown が返る', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'HTML' } });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain('HTML');
  });

  it('get_component で存在しないコンポーネントを検索すると代替提案付きの正常レスポンスを返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'NonExistentComponent999' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    const data = JSON.parse(text);
    expect(data.error).toContain('not found');
  });

  it('get_guide で tokens トピックが Markdown を返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_guide', arguments: { topic: 'tokens' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('デザイントークン');
  });

  it('get_guide で responsive トピックがブレークポイント情報を含む Markdown を返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'get_guide', arguments: { topic: 'responsive' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    expect(text).toContain('sm');
    expect(text).toContain('md');
  });

  it('search_docs が正常にデータを返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({ name: 'search_docs', arguments: { query: 'Box' } });
    expect(result.isError).toBeFalsy();

    const text = getText(result);
    const data = JSON.parse(text);
    expect(data.query).toBe('Box');
    expect(data.results).toBeDefined();
  });

  it('ツール一覧が7つ登録されている', async () => {
    const client = await createTestClient();
    const tools = await client.listTools();
    expect(tools.tools.length).toBe(7);
  });

  it('全ツールにreadOnlyHintアノテーションがある', async () => {
    const client = await createTestClient();
    const tools = await client.listTools();
    for (const tool of tools.tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
    }
  });
});
