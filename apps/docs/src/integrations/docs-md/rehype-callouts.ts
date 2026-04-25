/**
 * <div class="c--callout"> を GFM Alert 風 blockquote に変換する rehype プラグイン。
 *
 * 入力 HTML:
 *   <div class="c--callout" style="--keycolor:var(--blue)">
 *     <div class="c--callout_icon"><svg>...</svg></div>
 *     <p>For more details ...</p>
 *   </div>
 *
 * 出力 HTML（後段で rehype-remark が Markdown 化）:
 *   <blockquote>
 *     <p>[!NOTE]</p>
 *     <p>For more details ...</p>
 *   </blockquote>
 *
 * 結果として生成される Markdown:
 *   > [!NOTE]
 *   >
 *   > For more details ...
 *
 * keycolor → GFM Alert 種別マッピング（Callout.astro の preset に対応）:
 *   blue (info)    → NOTE
 *   green (check)  → TIP
 *   gray (note)    → NOTE
 *   orange (point) → IMPORTANT
 *   yellow (warn)  → WARNING
 *   red (alert)    → CAUTION
 *   purple (help)  → NOTE
 *   未知の色 / keycolor 不在 → NOTE
 *
 * c--callout_title が含まれる場合、<strong> 段落として GFM Alert 内に保持する。
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, ElementContent, Parents } from 'hast';
import { hasClass } from './util';

type GfmAlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';

const COLOR_TO_ALERT: Record<string, GfmAlertType> = {
  blue: 'NOTE',
  green: 'TIP',
  gray: 'NOTE',
  grey: 'NOTE',
  orange: 'IMPORTANT',
  yellow: 'WARNING',
  red: 'CAUTION',
  purple: 'NOTE',
};

const KEYCOLOR_RE = /--keycolor:\s*var\(--([a-z]+)\)/i;

function detectAlertType(node: Element): GfmAlertType {
  const style = node.properties?.style;
  if (typeof style === 'string') {
    const m = style.match(KEYCOLOR_RE);
    if (m && COLOR_TO_ALERT[m[1].toLowerCase()]) {
      return COLOR_TO_ALERT[m[1].toLowerCase()];
    }
  }
  return 'NOTE';
}

/**
 * c--callout_title の div を <strong> 段落に変換する。
 * その他の子要素はそのまま返す。
 */
function transformChild(child: ElementContent): ElementContent {
  if (child.type !== 'element') return child;
  if (child.tagName !== 'div') return child;
  if (!hasClass(child, 'c--callout_title')) return child;

  return {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: [
      {
        type: 'element',
        tagName: 'strong',
        properties: {},
        children: child.children,
      },
    ],
  } satisfies Element;
}

export function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Parents | undefined) => {
      if (index === undefined || !parent) return;
      if (node.tagName !== 'div') return;
      if (!hasClass(node, 'c--callout')) return;

      const alertType = detectAlertType(node);

      // アイコン要素を除去し、callout_title を strong 化
      const bodyChildren: ElementContent[] = [];
      for (const child of node.children) {
        if (child.type === 'element' && hasClass(child, 'c--callout_icon')) continue;
        bodyChildren.push(transformChild(child));
      }

      const blockquote: Element = {
        type: 'element',
        tagName: 'blockquote',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [{ type: 'text', value: `[!${alertType}]` }],
          },
          ...bodyChildren,
        ],
      };

      parent.children[index] = blockquote;
    });
  };
}
