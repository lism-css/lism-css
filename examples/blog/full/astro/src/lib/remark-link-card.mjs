/**
 * URL文字列だけの段落を`<LinkCard type="external" href="..." />`に変換するremarkプラグイン。
 *
 * 例:
 *   https://example.com
 *   → <LinkCard type="external" href="https://example.com" />
 *
 *   autolink形式（`[https://example.com](https://example.com)`）も同様に変換する。
 */
import { visit } from 'unist-util-visit';

const URL_PATTERN = /^https?:\/\/[^\s]+$/;

export function remarkLinkCard() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.children.length !== 1) return;

      const child = node.children[0];
      let url = null;

      if (child.type === 'text') {
        const text = child.value.trim();
        if (URL_PATTERN.test(text)) url = text;
      } else if (child.type === 'link') {
        const onlyChild = child.children[0];
        if (child.children.length === 1 && onlyChild?.type === 'text' && onlyChild.value === child.url) {
          url = child.url;
        }
      }

      if (!url) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'LinkCard',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'type',
            value: 'external',
          },
          {
            type: 'mdxJsxAttribute',
            name: 'href',
            value: url,
          },
        ],
        children: [],
      };
    });
  };
}
