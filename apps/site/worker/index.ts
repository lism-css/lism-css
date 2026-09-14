/**
 * 本番の静的アセット配信はMarkdownにcharsetを付けないため、UTF-8を明示する。
 * 304にも付与し、キャッシュ再検証でcharsetが失われるのを防ぐ。
 * ASSETSのヘッダーを引き継ぎ、404などのエラー応答は変更しない。
 */
type Env = {
  ASSETS: { fetch: typeof fetch };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    if (!response.ok && response.status !== 304) return response;

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(response.body, { status: response.status, headers });
  },
};
