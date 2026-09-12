/**
 * table要素をスクロール可能なdivで自動的にラップするrehypeプラグイン
 * SPなど画面幅が狭い環境でも、テーブルを横スクロールできるようにする
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, Parents } from 'hast';

export function rehypeWrapTable() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (node.tagName !== 'table') return;
      if (index === undefined || !parent) return;

      const wrapperElement: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['-ov-x:auto'] },
        children: [node],
      };

      parent.children[index] = wrapperElement;
    });
  };
}
