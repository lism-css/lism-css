/**
 * .md 出力に不要な要素・属性を除去する rehype プラグイン。
 *
 * - <nav class="c--postNav">: 前後記事ナビ
 * - <script> / <style>: クライアント側の挙動・装飾用（Markdown には不要）
 * - data-astro-cid-* 属性: Astro のスコープ CSS 識別子
 */
import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element, Parents } from 'hast';
import { hasClass } from './util';

const DROP_TAG = new Set(['script', 'style']);

export function rehypeStripNoise() {
  return (tree: Root) => {
    // ノード除去（後ろから走査するために走査後に処理）
    const removals: Array<{ parent: Parents; index: number }> = [];

    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (index === undefined || !parent) return;

      // タグ名で除去
      if (DROP_TAG.has(node.tagName)) {
        removals.push({ parent, index });
        return SKIP; // 子孫は走査しないが兄弟は引き続き処理
      }

      // class で除去
      if (node.tagName === 'nav' && hasClass(node, 'c--postNav')) {
        removals.push({ parent, index });
        return SKIP;
      }

      // data-astro-cid-* 属性ストリップ
      if (node.properties) {
        for (const key of Object.keys(node.properties)) {
          // hast は data-* 属性を camelCase 化する: dataAstroCidXxx
          if (key.startsWith('dataAstroCid')) {
            delete node.properties[key];
          }
        }
      }
    });

    // 後ろから削除（インデックスがずれないように）
    removals.sort((a, b) => b.index - a.index);
    for (const { parent, index } of removals) {
      parent.children.splice(index, 1);
    }
  };
}
