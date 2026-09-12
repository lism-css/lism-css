/**
 * Expressive Code が出力する <pre data-language="X"> から言語名を取り出し、
 * 内側の <code> に class="language-X" を付与する rehype プラグイン。
 *
 * これにより rehype-remark が言語ラベル付きコードフェンスを生成できるようになる。
 * 例: <pre data-language="html"><code>...</code></pre>
 *   → ```html ... ```
 */
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export function rehypeCodeLanguage() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') return;
      const lang = node.properties?.dataLanguage;
      if (typeof lang !== 'string' || lang === '') return;

      const codeChild = node.children.find((c) => c.type === 'element' && c.tagName === 'code') as Element | undefined;
      if (!codeChild) return;

      // 既存の className を保持しつつ language-X を追加
      const existing = codeChild.properties?.className;
      const classes = Array.isArray(existing) ? existing.filter((c) => typeof c === 'string') : [];
      if (!classes.some((c) => typeof c === 'string' && c.startsWith('language-'))) {
        classes.push(`language-${lang}`);
      }
      codeChild.properties = { ...(codeChild.properties ?? {}), className: classes };
    });
  };
}
