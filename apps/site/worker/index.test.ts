import { describe, expect, it } from 'vitest';
import worker from './index';

describe('Markdown Worker', () => {
  it.each([200, 304])('%i応答にcharsetを付け、本文とキャッシュヘッダーを維持する', async (status) => {
    const body = status === 304 ? null : '# 日本語';
    const response = new Response(body, {
      status,
      headers: {
        'Content-Type': 'text/markdown',
        ETag: '"markdown-v1"',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
    const result = await worker.fetch(new Request('https://example.com/ui.md'), {
      ASSETS: { fetch: () => Promise.resolve(response) },
    });

    expect(result.status).toBe(status);
    expect(result.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(result.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(result.headers.get('ETag')).toBe('"markdown-v1"');
    expect(result.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
    expect(await result.text()).toBe(body ?? '');
  });

  it('存在しないMarkdownのHTML 404をそのまま返す', async () => {
    const response = new Response('<h1>404</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    });
    const result = await worker.fetch(new Request('https://example.com/naming.md'), {
      ASSETS: { fetch: () => Promise.resolve(response) },
    });

    expect(result).toBe(response);
  });
});
