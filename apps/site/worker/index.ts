/**
 * .md 配信用の最小 Worker
 *
 * Cloudflare の静的アセット配信は本番で `.md` に charset 無しの `Content-Type: text/markdown` を付ける。
 * 日本語の Markdown をブラウザで直接開いたときの文字化けを防ぐため、charset 付きに付け替える。
 * wrangler.jsonc の `run_worker_first: ["/*.md"]` により、この Worker には `.md` のリクエストだけが来る。
 *
 * 実在する .md（200）にだけヘッダーを付け、存在しない .md は ASSETS が返す HTML の 404 をそのまま返す
 * （存在しない .md に text/markdown が付く不整合 #506 を再発させないため）。
 * `_headers` は Worker が生成したレスポンスには適用されないので、X-Robots-Tag もここで付ける。
 */
type Env = {
  ASSETS: { fetch: typeof fetch };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    if (!response.ok) return response;

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(response.body, { status: response.status, headers });
  },
};
