import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerConvertCss } from '../tools/convert-css.js';

async function createTestClient() {
  const server = new McpServer({ name: 'test', version: '0.0.1' });
  registerConvertCss(server);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({ name: 'test-client', version: '0.0.1' });
  await client.connect(clientTransport);

  return client;
}

function getResult(result: Awaited<ReturnType<Client['callTool']>>) {
  const text = (result.content as { type: string; text: string }[])[0].text;
  return JSON.parse(text);
}

describe('convert_css', () => {
  it('基本的な CSS 宣言を変換できる', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'padding: 20px; font-size: 16px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.conversions).toBeDefined();
    expect(data.conversions.length).toBe(2);

    const paddingConv = data.conversions.find((c: { css: string }) => c.css.includes('padding'));
    expect(paddingConv).toBeDefined();
    expect(paddingConv.lismProp).toBe('p');
  });

  it('セレクタ付きの CSS を処理できる', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: '.foo { padding: 1rem; color: red; }' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.conversions.length).toBe(2);
  });

  it('@media ルールでエラーを返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: '@media (max-width: 768px) { .foo { padding: 1rem; } }' },
    });
    expect(result.isError).toBe(true);

    const data = getResult(result);
    expect(data.error).toContain('@media');
  });

  it('@keyframes ルールでエラーを返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: '@keyframes fade { from { opacity: 0 } to { opacity: 1 } }' },
    });
    expect(result.isError).toBe(true);

    const data = getResult(result);
    expect(data.error).toContain('@keyframes');
  });

  it('data: URI を含む値を壊さない', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'background-image: url(data:image/png;base64,abc123); padding: 10px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.conversions.length).toBe(2);

    const bgConv = data.conversions.find((c: { css: string }) => c.css.includes('background-image'));
    expect(bgConv).toBeDefined();
    expect(bgConv.css).toContain('data:image/png;base64,abc123');
  });

  it('display: flex でコンポーネント Flex を提案する', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'display: flex; gap: 16px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.suggestedComponent).toBeDefined();
    expect(data.suggestedComponent.name).toBe('Flex');
  });

  it('display: flex + flex-direction: column で Stack を提案する', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'display: flex; flex-direction: column; gap: 20px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.suggestedComponent.name).toBe('Stack');
  });

  it('display: grid + place-items: center で Center を提案する', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'display: grid; place-items: center;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.suggestedComponent.name).toBe('Center');
  });

  it('Lism Props に対応しない CSS は unmapped として返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'transition: all 0.3s ease;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    const conv = data.conversions[0];
    expect(conv.lismProp).toBeNull();
    expect(conv.confidence).toBe('unmapped');
  });

  it('空の入力でエラーを返す', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: '' },
    });
    expect(result.isError).toBe(true);
  });

  it('使用例（example）が生成される', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'padding: 20px; font-size: 16px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.example).toBeDefined();
    expect(data.example).toContain('<');
    expect(data.example).toContain('>');
  });

  it('confidence フィールドが含まれる', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'padding: 20px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    expect(data.conversions[0].confidence).toBeDefined();
    expect(['exact', 'approximate', 'unmapped']).toContain(data.conversions[0].confidence);
  });

  it('プリセット値を持たない prop でも mapping があれば unmapped にならない', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'convert_css',
      arguments: { css: 'margin-top: 12px;' },
    });
    expect(result.isError).toBeFalsy();

    const data = getResult(result);
    const conv = data.conversions[0];
    expect(conv.lismProp).toBe('mt');
    expect(conv.confidence).not.toBe('unmapped');
  });
});
