/**
 * URL 文字列だけの段落を `<LinkCard type="external" href="..." />` に変換する MDAST プラグイン。
 *
 *   https://example.com
 *   → <LinkCard type="external" href="https://example.com" />
 *
 * GFM autolink で `paragraph > link` になった形（`[https://x](https://x)` も同じ）も変換する。
 */
import { defineMdastPlugin } from 'satteri';

const URL_PATTERN = /^https?:\/\/\S+$/;

function resolveUrl(paragraph) {
  if (paragraph.children.length !== 1) return null;
  const child = paragraph.children[0];

  if (child.type === 'text') {
    const text = child.value.trim();
    return URL_PATTERN.test(text) ? text : null;
  }
  if (child.type === 'link') {
    const onlyChild = child.children[0];
    if (child.children.length === 1 && onlyChild?.type === 'text' && onlyChild.value === child.url) {
      return child.url;
    }
  }
  return null;
}

export const linkCard = defineMdastPlugin({
  name: 'link-card',

  paragraph(node) {
    const url = resolveUrl(node);
    if (!url) return;
    return {
      type: 'mdxJsxFlowElement',
      name: 'LinkCard',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'type', value: 'external' },
        { type: 'mdxJsxAttribute', name: 'href', value: url },
      ],
      children: [],
    };
  },
});
