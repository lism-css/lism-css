import type { APIRoute } from 'astro';

/**
 * robots.txt を動的生成する endpoint。
 * astro.config の `site` を URL の起点として使うため、`site` を書き換えるだけで
 * sitemap の URL もここに自動で反映される（書き換え漏れを防ぐ）。
 */
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error('astro.config の `site` が未設定です。robots.txt の生成には `site` の設定が必要です。');
  }

  const sitemapUrl = new URL('sitemap-index.xml', site).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
