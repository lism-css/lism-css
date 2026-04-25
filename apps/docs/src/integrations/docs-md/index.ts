/**
 * docs-md: ビルド時に MDX レンダリング後の HTML から AI 向け .md ファイルを生成する Astro integration。
 *
 * astro:build:done フックで `pages` を走査し、対象パス配下のページについて
 * `dist/{path}/index.html` → `dist/{path}.md` の変換を行う。
 * article[data-pagefind-body] が無いページ（リダイレクト先・ランディング等）は
 * 警告ログを出してスキップする。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { convertHtmlToMd } from './convert-html-to-md';

// 変換対象のパスプレフィックス。templates / demo / preview / page-layout / og 等は対象外
const INCLUDE_PREFIXES = ['docs/', 'ui/', 'en/docs/', 'en/ui/'];

function isTargetPage(pathname: string): boolean {
  const trimmed = pathname.replace(/^\/+/, '');
  return INCLUDE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

function pageToPaths(pathname: string, distDir: string): { html: string; md: string; rel: string } {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  return {
    html: path.join(distDir, trimmed, 'index.html'),
    md: path.join(distDir, `${trimmed}.md`),
    rel: `${trimmed}.md`,
  };
}

export default function docsMd(): AstroIntegration {
  let siteUrl = '';
  return {
    name: 'docs-md',
    hooks: {
      'astro:config:done': ({ config }) => {
        // 絶対 URL 化のために site を保持。未設定だと .md 内のリンクが相対のままになる
        siteUrl = config.site ?? '';
      },
      'astro:build:done': async ({ dir, pages, logger }) => {
        if (!siteUrl) {
          logger.warn('astro config `site` is not set; links in .md will remain relative');
        }
        const distDir = fileURLToPath(dir);
        let success = 0;
        let failed = 0;

        for (const page of pages) {
          if (!isTargetPage(page.pathname)) continue;
          const { html, md, rel } = pageToPaths(page.pathname, distDir);
          try {
            await convertHtmlToMd(html, md, { siteUrl });
            success++;
          } catch (err) {
            // article[data-pagefind-body] が無いページ（インデックスページ等）はここでスキップ
            logger.warn(`skipped ${rel}: ${(err as Error).message}`);
            failed++;
          }
        }
        logger.info(`generated ${success} markdown files (${failed} skipped)`);
      },
    },
  };
}
