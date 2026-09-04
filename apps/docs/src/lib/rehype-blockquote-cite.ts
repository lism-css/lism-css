/**
 * blockquote内の `-- ` で始まる部分を出典情報として抽出し、
 * <figure> + <blockquote> + <figcaption> 構造に変換するrehypeプラグイン
 *
 * 例1（URLあり）:
 * 入力（Markdown）:
 *   > これは引用文です。
 *   >
 *   > -- [出典元の名前](https://example.com)
 *
 * 出力（HTML）:
 *   <figure class="b--blockquote">
 *     <blockquote cite="https://example.com">
 *       <p>これは引用文です。</p>
 *     </blockquote>
 *     <figcaption>
 *       <a href="https://example.com">出典元の名前</a>
 *     </figcaption>
 *   </figure>
 *
 * 例2（URLなし）:
 * 入力（Markdown）:
 *   > これは引用文です。
 *   >
 *   > -- 出典元の名前
 *
 * 出力（HTML）:
 *   <figure class="b--blockquote">
 *     <blockquote>
 *       <p>これは引用文です。</p>
 *     </blockquote>
 *     <figcaption>出典元の名前</figcaption>
 *   </figure>
 *
 * 対応パターン: `-- ` または `— `（emダッシュ）で始まる行
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, ElementContent, Parents } from 'hast';

const CITE_PATTERN = /^(?:--|—)\s*/;

interface CiteInfo {
  text: string;
  url?: string;
}

function extractCiteInfo(pElement: Element): CiteInfo | null {
  const pChildren = pElement.children;
  if (pChildren.length === 0) return null;

  const firstChild = pChildren[0];

  if (firstChild.type === 'text') {
    const textContent = firstChild.value;

    if (!CITE_PATTERN.test(textContent)) return null;

    const remainingText = textContent.replace(CITE_PATTERN, '');

    if (remainingText.trim()) {
      return { text: remainingText.trim() };
    }

    if (pChildren.length > 1) {
      const secondChild = pChildren[1];
      if (secondChild.type === 'element' && secondChild.tagName === 'a') {
        const linkElement = secondChild;
        const href = linkElement.properties?.href as string | undefined;
        const linkText = extractTextContent(linkElement);
        return { text: linkText, url: href };
      }
    }
  }

  return null;
}

function extractTextContent(element: Element): string {
  let text = '';
  for (const child of element.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if (child.type === 'element') {
      text += extractTextContent(child);
    }
  }
  return text;
}

export function rehypeBlockquoteCite() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (node.tagName !== 'blockquote') return;
      if (index === undefined || !parent) return;

      const children = node.children;
      if (children.length === 0) return;

      // 末尾の空白を除いて、最後の段落を出典として解析する
      let lastElementIndex = children.length - 1;
      while (lastElementIndex >= 0) {
        const child = children[lastElementIndex];
        if (child.type === 'text' && /^\s*$/.test(child.value)) {
          lastElementIndex--;
          continue;
        }
        break;
      }

      if (lastElementIndex < 0) return;

      const lastElement = children[lastElementIndex];

      if (lastElement.type !== 'element' || lastElement.tagName !== 'p') return;

      const citeInfo = extractCiteInfo(lastElement);
      if (!citeInfo) return;

      // 引用本文と出典をfigureへ組み直す
      const blockquoteChildren: ElementContent[] = children.slice(0, lastElementIndex);
      while (blockquoteChildren.length > 0) {
        const last = blockquoteChildren[blockquoteChildren.length - 1];
        if (last.type === 'text' && /^\s*$/.test(last.value)) {
          blockquoteChildren.pop();
        } else {
          break;
        }
      }

      const figcaptionChildren: ElementContent[] = citeInfo.url
        ? [
            {
              type: 'element',
              tagName: 'a',
              properties: { href: citeInfo.url },
              children: [{ type: 'text', value: citeInfo.text }],
            },
          ]
        : [{ type: 'text', value: citeInfo.text }];

      const figureElement: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['b--blockquote'] },
        children: [
          {
            type: 'element',
            tagName: 'blockquote',
            properties: citeInfo.url ? { cite: citeInfo.url } : {},
            children: blockquoteChildren,
          },
          { type: 'text', value: '\n' },
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: figcaptionChildren,
          },
        ],
      };

      parent.children[index] = figureElement;
    });
  };
}
