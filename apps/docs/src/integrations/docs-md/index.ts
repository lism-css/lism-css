/**
 * docs-md: ビルド時に MDX レンダリング後の HTML から AI 向け .md ファイルを生成する Astro integration。
 *
 * PoC フェーズ: overview ページ（ja / en）のみを対象に、最小パイプラインで .md を出力する。
 * 後続コミットで rehype プラグイン群（ノイズ除去・Expressive Code unwrap・callout 変換 等）を追加していく。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { convertHtmlToMd } from './convert-html-to-md';

// PoC 対象ページ。後続で routes / pages から自動収集する形に置き換える
const POC_PAGES = ['docs/overview', 'en/docs/overview'];

export default function docsMd(): AstroIntegration {
  return {
    name: 'docs-md',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        for (const page of POC_PAGES) {
          const htmlPath = path.join(distDir, page, 'index.html');
          const mdPath = path.join(distDir, `${page}.md`);
          try {
            await convertHtmlToMd(htmlPath, mdPath);
            logger.info(`generated ${page}.md`);
          } catch (err) {
            logger.warn(`failed to generate ${page}.md: ${(err as Error).message}`);
          }
        }
      },
    },
  };
}
