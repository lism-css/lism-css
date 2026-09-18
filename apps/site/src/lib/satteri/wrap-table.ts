/**
 * table 要素をスクロール可能な div で包む HAST プラグイン。
 * SP など画面幅が狭い環境でも、テーブルを横スクロールできるようにする。
 *
 * 入力: <table>…</table>
 * 出力: <div class="-ov-x:auto"><table>…</table></div>
 */
import { defineHastPlugin } from 'satteri';
import type { Element } from 'hast';

export const wrapTable = defineHastPlugin({
  name: 'wrap-table',
  element: {
    filter: ['table'],
    visit(node) {
      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['-ov-x:auto'] },
        children: [node],
      };
      return wrapper;
    },
  },
});
