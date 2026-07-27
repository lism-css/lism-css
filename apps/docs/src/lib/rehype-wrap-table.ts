/**
 * table要素をスクロール可能なdivで自動的にラップするrehypeプラグイン
 * SPなど画面幅が狭い環境でも、テーブルを横スクロールできるようにする
 *
 * 入力（HTML）:
 *   <table>...</table>
 *
 * 出力（HTML）:
 *   <div class="-ov-x:auto">
 *     <table>...</table>
 *   </div>
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, Parents } from 'hast';

export function rehypeWrapTable() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      // table要素のみ処理
      if (node.tagName !== 'table') return;
      if (index === undefined || !parent) return;

      const wrapperElement: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['-ov-x:auto'] },
        children: [node],
      };

      // 親要素内でtableをラップしたdivに置き換え
      parent.children[index] = wrapperElement;
    });
  };
}
