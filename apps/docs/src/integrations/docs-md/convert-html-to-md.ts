/**
 * ビルド後の HTML から `article[data-pagefind-body]` を抽出し、
 * Markdown に変換する最小パイプライン（PoC）。
 *
 * このフェーズではノイズ除去・Expressive Code unwrap・callout 変換 等の
 * 専用 rehype プラグインはまだ繋ぎ込まず、unified の素通しで MD 化する。
 */
import fs from 'node:fs/promises';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import type { Root as HastRoot, Element } from 'hast';

/**
 * data-pagefind-body を持つ <article> 要素のみを残す rehype プラグイン。
 * 該当ノードが見つからない場合は例外を投げて呼び出し側に判定させる。
 */
function rehypeKeepArticle() {
  return (tree: HastRoot) => {
    let target: Element | undefined;
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'article') return;
      const attr = node.properties?.dataPagefindBody;
      if (attr === true || attr === 'true' || attr === '') {
        target = node;
        return false; // 最初の 1 件で打ち切り
      }
    });
    if (!target) {
      throw new Error('article[data-pagefind-body] not found');
    }
    tree.children = [target];
  };
}

export async function convertHtmlToMd(htmlPath: string, mdPath: string): Promise<void> {
  const html = await fs.readFile(htmlPath, 'utf8');

  const file = await unified()
    .use(rehypeParse)
    .use(rehypeKeepArticle)
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: '-',
      fences: true,
      incrementListMarker: false,
    })
    .process(html);

  await fs.writeFile(mdPath, String(file));
}
