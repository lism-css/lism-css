/**
 * デプロイ検証用スモークテスト
 *
 * Cloudflare Workers（静的アセット配信）のレスポンスを HTTP で機械的に検査する。
 * ローカル（wrangler dev）・workers.dev・本番を同じ検査項目で確認し、環境間の確認漏れを防ぐ。
 * 1 件でも失敗したら終了コード 1 で終了する。
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts --base=http://localhost:8787
 *   npx tsx scripts/smoke-test.ts --base=https://lism-site.<subdomain>.workers.dev --expect-html-noindex
 *   npx tsx scripts/smoke-test.ts --base=https://lism-css.com
 *
 * --expect-html-noindex:
 *   workers.dev ホスト上では public/_headers のホスト付きルールで HTML にも X-Robots-Tag: noindex が付く。
 *   本番カスタムドメインには付かないため、期待値をこのフラグで切り替える。
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    'expect-html-noindex': { type: 'boolean', default: false },
  },
});

if (!values.base) {
  console.error('Usage: npx tsx scripts/smoke-test.ts --base=<URL> [--expect-html-noindex]');
  process.exit(2);
}

const BASE = values.base.replace(/\/+$/, '');
const EXPECT_HTML_NOINDEX = values['expect-html-noindex'];
const SITE_ORIGIN = 'https://lism-css.com';
const REDIRECTS_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../public/_redirects');

// public/_headers の OG 画像ルールと同じ値
const OG_CACHE_CONTROL = 'public, s-maxage=31536000, max-age=86400, must-revalidate';

const HTML_PAGES = ['/', '/docs/overview/', '/en/', '/en/docs/overview/'];
// 小文字 primitive URL は astroRedirects（Astro 出力の meta refresh ページ）で扱う。本番互換のため 301 ではなく 200 が期待値
const META_REFRESH_PAGES: [string, string][] = [
  ['/docs/primitives/l--fluidcols/', '/docs/primitives/l--autoColumns/'],
  ['/en/docs/primitives/l--fluidcols/', '/en/docs/primitives/l--autoColumns/'],
];
// 浅い階層・深い階層の両方（_headers の /*.md が複数セグメントに効くことの確認を兼ねる）
const MD_PAGES = ['/ui.md', '/ui/accordion.md', '/docs/primitives/a--decorator.md', '/en/ui.md', '/en/ui/accordion.md'];
// OG 画像の 4 出力ディレクトリ（/docs/og, /ui/og, /en/docs/og, /en/ui/og）を 1 ページずつ
const OG_PAGES = ['/docs/overview/', '/ui/accordion/', '/en/docs/overview/', '/en/ui/accordion/'];
const STATIC_FILES: [string, string][] = [
  ['/llms.txt', 'text/plain'],
  ['/robots.txt', 'text/plain'],
  ['/sitemap-index.xml', 'xml'],
  ['/pagefind/pagefind.js', 'javascript'],
];

type Redirect = { source: string; destination: string; status: number };
type Result = { name: string; failures: string[] };

const results: Result[] = [];

/** public/_redirects を読み、検査対象のリダイレクト一覧を作る（定義の二重管理を避ける） */
function loadRedirects(): Redirect[] {
  return readFileSync(REDIRECTS_FILE, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [source, destination, code] = line.split(/\s+/);
      return { source, destination, status: Number(code ?? 302) };
    });
}

function get(path: string): Promise<Response> {
  return fetch(BASE + path, { redirect: 'manual' });
}

function contentType(res: Response): string {
  return (res.headers.get('content-type') ?? '').toLowerCase().replace(/\s+/g, '');
}

function hasToken(value: string | null, token: string): boolean {
  return (value ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .includes(token);
}

function expectStatus(res: Response, expected: number | number[]): string | null {
  const list = Array.isArray(expected) ? expected : [expected];
  return list.includes(res.status) ? null : `status: expected ${list.join('|')}, got ${res.status}`;
}

function expectContentTypeIncludes(res: Response, fragment: string): string | null {
  return contentType(res).includes(fragment) ? null : `content-type: expected to include "${fragment}", got "${res.headers.get('content-type')}"`;
}

function expectContentTypeIs(res: Response, expected: string): string | null {
  const normalized = expected.toLowerCase().replace(/\s+/g, '');
  return contentType(res) === normalized ? null : `content-type: expected "${expected}", got "${res.headers.get('content-type')}"`;
}

function expectLocation(res: Response, expectedPath: string): string | null {
  const location = res.headers.get('location');
  if (!location) return 'location: header missing';
  const actual = new URL(location, BASE).pathname;
  return actual === expectedPath ? null : `location: expected "${expectedPath}", got "${location}"`;
}

function expectNoindex(res: Response, expected: boolean): string | null {
  const actual = hasToken(res.headers.get('x-robots-tag'), 'noindex');
  if (actual === expected) return null;
  return expected ? 'x-robots-tag: noindex expected but missing' : `x-robots-tag: noindex must not be set, got "${res.headers.get('x-robots-tag')}"`;
}

function compact(items: (string | null)[]): string[] {
  return items.filter((item): item is string => item !== null);
}

async function check(name: string, fn: () => Promise<(string | null)[]>): Promise<void> {
  let failures: string[];
  try {
    failures = compact(await fn());
  } catch (error) {
    failures = [`error: ${error instanceof Error ? error.message : String(error)}`];
  }
  results.push({ name, failures });
  console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} ${name}`);
  for (const failure of failures) console.log(`       ${failure}`);
}

async function main(): Promise<void> {
  console.log(`base: ${BASE}`);
  console.log(`expect HTML noindex: ${EXPECT_HTML_NOINDEX}\n`);

  for (const path of HTML_PAGES) {
    await check(`GET ${path} -> 200 HTML`, async () => {
      const res = await get(path);
      return [expectStatus(res, 200), expectContentTypeIncludes(res, 'text/html'), expectNoindex(res, EXPECT_HTML_NOINDEX)];
    });
  }

  // Astro の directory 形式出力（{path}/index.html）と Workers の auto-trailing-slash の整合
  await check('GET /docs/overview -> redirect to /docs/overview/', async () => {
    const res = await get('/docs/overview');
    return [expectStatus(res, [301, 307, 308]), expectLocation(res, '/docs/overview/')];
  });

  for (const { source, destination, status } of loadRedirects()) {
    await check(`GET ${source} -> ${status} ${destination}`, async () => {
      const res = await get(source);
      return [expectStatus(res, status), expectLocation(res, destination)];
    });
  }

  for (const [path, destination] of META_REFRESH_PAGES) {
    await check(`GET ${path} -> 200 meta refresh to ${destination}`, async () => {
      const res = await get(path);
      const body = await res.text();
      return [
        expectStatus(res, 200),
        expectContentTypeIncludes(res, 'text/html'),
        body.includes(`content="0;url=${destination}"`) ? null : `body: meta refresh to ${destination} not found`,
        body.includes('<meta name="robots" content="noindex">') ? null : 'body: robots noindex meta not found',
        body.includes(`<link rel="canonical" href="${SITE_ORIGIN}${destination}">`) ? null : 'body: canonical link not found',
      ];
    });
  }

  for (const path of MD_PAGES) {
    await check(`GET ${path} -> 200 text/markdown + noindex`, async () => {
      const res = await get(path);
      return [expectStatus(res, 200), expectContentTypeIs(res, 'text/markdown; charset=utf-8'), expectNoindex(res, true)];
    });
  }

  // 存在しない .md は HTML の 404 で返し、text/markdown を付けない（#506）
  await check('GET /naming.md -> 404 HTML without text/markdown (#506)', async () => {
    const res = await get('/naming.md');
    return [
      expectStatus(res, 404),
      expectContentTypeIncludes(res, 'text/html'),
      contentType(res).includes('text/markdown') ? `content-type: must not be text/markdown, got "${res.headers.get('content-type')}"` : null,
    ];
  });

  await check('GET /this-page-does-not-exist/ -> 404 custom page', async () => {
    const res = await get('/this-page-does-not-exist/');
    const body = await res.text();
    return [
      expectStatus(res, 404),
      expectContentTypeIncludes(res, 'text/html'),
      body.includes('404 - Page Not Found') ? null : 'body: custom 404 page not found',
    ];
  });

  for (const page of OG_PAGES) {
    await check(`OG image of ${page} -> 200 PNG with Cache-Control`, async () => {
      const html = await (await get(page)).text();
      const match = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (!match) return ['og:image meta not found'];
      const res = await get(new URL(match[1]).pathname);
      const cacheControl = res.headers.get('cache-control');
      return [
        expectStatus(res, 200),
        expectContentTypeIncludes(res, 'image/png'),
        cacheControl === OG_CACHE_CONTROL ? null : `cache-control: expected "${OG_CACHE_CONTROL}", got "${cacheControl}"`,
      ];
    });
  }

  for (const [path, fragment] of STATIC_FILES) {
    await check(`GET ${path} -> 200 ${fragment}`, async () => {
      const res = await get(path);
      return [expectStatus(res, 200), expectContentTypeIncludes(res, fragment)];
    });
  }

  const failed = results.filter((r) => r.failures.length > 0);
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
  process.exit(failed.length === 0 ? 0 : 1);
}

await main();
