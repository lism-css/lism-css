/**
 * Preview 系コンポーネントの整形を担う rehype プラグイン。
 *
 * - <div class="c--preview_area">: ライブデモ領域。.md には不要なので丸ごと削除
 * - <div class="c--preview_title">: タイトル行。デフォルト値（"Preview"/"例"）が
 *   大半でノイズ化するため丸ごと削除（必要な説明文はプロース側に書く運用）
 * - <div class="c--preview_help">: 「リサイズ可能」等のヒント。削除
 * - <div class="c--tabs_list">: タブのボタン行（JSX/HTML 等の見出し）。削除
 * - <span class="__decorator">: 装飾要素（残存する場合に備えて）。削除
 *
 * 残りの c--preview / c--preview_code / c--tabs_panel は透明なコンテナとして
 * rehype-remark に任せる（子要素はそのまま出力される）。
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, Parents } from 'hast';
import { hasClass } from './util';

const DROP_CLASSES = ['c--preview_area', 'c--preview_title', 'c--preview_help', 'c--tabs_list', '__decorator'];

export function rehypePreview() {
  return (tree: Root) => {
    const removals: Array<{ parent: Parents; index: number }> = [];

    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (index === undefined || !parent) return;
      for (const cls of DROP_CLASSES) {
        if (hasClass(node, cls)) {
          removals.push({ parent, index });
          break;
        }
      }
    });

    removals.sort((a, b) => b.index - a.index);
    for (const { parent, index } of removals) {
      parent.children.splice(index, 1);
    }
  };
}
