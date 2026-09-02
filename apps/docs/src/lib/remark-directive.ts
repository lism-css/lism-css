/**
 * remark-directive による directive を処理するプラグイン
 *
 * このプラグインは以下の2つの処理を行います：
 *
 * 1. textDirective（:name 記法）を元のテキストに復元
 *    - remark-directive は :name 形式を textDirective として解析するが、
 *      このプロジェクトでは使用しないため、元のテキストに戻す
 *    - これにより「1:2」のような文字列が意図せず解析されることを防ぐ
 *
 * 2. containerDirective（:::type 記法）を Callout コンポーネントに変換
 *
 * :::type の使用例：
 * 入力（MDX）:
 *   :::tip
 *   ここに文章
 *   :::
 *
 * 出力（変換後）:
 *   <Callout type="tip">ここに文章</Callout>
 *
 * タイトル付きの例：
 * 入力（MDX）:
 *   :::tip
 *   ::title[タイトルテキスト]
 *   ここに文章
 *   :::
 *
 * 出力（変換後）:
 *   <Callout type="tip">
 *     <div class="c--docsNote_title">タイトルテキスト</div>
 *     ここに文章
 *   </Callout>
 *
 * 対応するtype: alert, point, tip, warning, check, help, note, info
 */
import { visit } from 'unist-util-visit';
import type { Root, Parent, RootContent } from 'mdast';
import type { ContainerDirective, TextDirective, LeafDirective } from 'mdast-util-directive';

const CALLOUT_TYPES = ['alert', 'point', 'tip', 'warning', 'check', 'help', 'note', 'info'];

interface MdxJsxAttribute {
  type: 'mdxJsxAttribute';
  name: string;
  value: string;
}

interface MdxJsxFlowElement {
  type: 'mdxJsxFlowElement';
  name: string;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

function isTextDirective(node: RootContent): node is TextDirective {
  return node.type === 'textDirective';
}

function isContainerDirective(node: RootContent): node is ContainerDirective {
  return node.type === 'containerDirective';
}

function isLeafDirective(node: RootContent): node is LeafDirective {
  return node.type === 'leafDirective';
}

export function remarkDirectiveHandler() {
  return (tree: Root) => {
    visit(tree, (node: Root | RootContent, index: number | undefined, parent: Parent | undefined) => {
      if (node.type === 'root') return;

      // 誤変換を防ぐため、未使用のtextDirectiveは元のMarkdown表記へ戻す
      if (isTextDirective(node)) {
        if (index === undefined || !parent) return;

        let restoredText = `:${node.name}`;

        if (node.children.length > 0) {
          const labelText = extractText(node.children);
          restoredText += `[${labelText}]`;
        }

        if (node.attributes && Object.keys(node.attributes).length > 0) {
          const attrsStr = Object.entries(node.attributes)
            .map(([key, value]) => (value === '' ? key : `${key}="${String(value)}"`))
            .join(' ');
          restoredText += `{${attrsStr}}`;
        }

        parent.children.splice(index, 1, { type: 'text', value: restoredText } as RootContent);
        return;
      }

      // containerDirectiveをCalloutへ変換し、::titleを見出し要素にする
      if (isContainerDirective(node)) {
        const directiveName = node.name;

        if (CALLOUT_TYPES.includes(directiveName)) {
          const mappedChildren = node.children.map((child) => {
            if (isLeafDirective(child) && child.name === 'title') {
              return {
                type: 'mdxJsxFlowElement',
                name: 'div',
                attributes: [
                  {
                    type: 'mdxJsxAttribute',
                    name: 'class',
                    value: 'c--docsNote_title',
                  },
                ],
                children: child.children,
              } as unknown as RootContent;
            }
            return child;
          });

          const mdxNode = node as unknown as MdxJsxFlowElement;
          mdxNode.type = 'mdxJsxFlowElement';
          mdxNode.name = 'Callout';
          mdxNode.attributes = [
            {
              type: 'mdxJsxAttribute',
              name: 'type',
              value: directiveName,
            },
          ];
          mdxNode.children = mappedChildren;
        }
      }
    });
  };
}

function extractText(nodes: RootContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return node.value;
      }
      if ('children' in node) {
        return extractText(node.children);
      }
      return '';
    })
    .join('');
}
