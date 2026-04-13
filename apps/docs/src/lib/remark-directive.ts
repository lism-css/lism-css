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
 *   :::point
 *   ここに文章
 *   :::
 *
 * 出力（変換後）:
 *   <Callout type="point">ここに文章</Callout>
 *
 * タイトル付きの例：
 * 入力（MDX）:
 *   :::point
 *   ::title[タイトルテキスト]
 *   ここに文章
 *   :::
 *
 * 出力（変換後）:
 *   <Callout type="point">
 *     <div class="c--callout_title">タイトルテキスト</div>
 *     ここに文章
 *   </Callout>
 *
 * 対応するtype: alert, point, warning, check, help, note, info
 */
import { visit } from 'unist-util-visit';
import type { Root, Parent, RootContent } from 'mdast';
// mdast の型拡張（directive 型を有効化）
import type { ContainerDirective, TextDirective, LeafDirective } from 'mdast-util-directive';

// Calloutで使用可能なtype一覧
const CALLOUT_TYPES = ['alert', 'point', 'warning', 'check', 'help', 'note', 'info'];

// MDX JSX 要素の型（remark-mdx で拡張される型を簡易的に定義）
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

// ノードの型ガード
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

      // textDirective（:で始まる記法）を元のテキストに復元
      // このプロジェクトでは textDirective は使用しないため、元の形式に戻す
      if (isTextDirective(node)) {
        if (index === undefined || !parent) return;

        // textDirective を元のテキスト形式に復元
        // 例: :name → ":name", :name[label] → ":name[label]"
        let restoredText = `:${node.name}`;

        // label（[...]の中身）がある場合は復元
        if (node.children.length > 0) {
          const labelText = extractText(node.children);
          restoredText += `[${labelText}]`;
        }

        // attributes（{...}の中身）がある場合は復元
        if (node.attributes && Object.keys(node.attributes).length > 0) {
          const attrsStr = Object.entries(node.attributes)
            .map(([key, value]) => (value === '' ? key : `${key}="${String(value)}"`))
            .join(' ');
          restoredText += `{${attrsStr}}`;
        }

        // textDirective ノードを text ノードに置き換え
        parent.children.splice(index, 1, { type: 'text', value: restoredText } as RootContent);
        return;
      }

      // containerDirective（:::で囲まれたブロック）を Callout に変換
      if (isContainerDirective(node)) {
        const directiveName = node.name;

        // Calloutの対応するtypeかチェック
        if (CALLOUT_TYPES.includes(directiveName)) {
          // 子要素内の ::title ディレクティブを変換
          const mappedChildren = node.children.map((child) => {
            // leafDirective（::で始まる記法）でnameが'title'の場合
            if (isLeafDirective(child) && child.name === 'title') {
              // div要素に変換
              return {
                type: 'mdxJsxFlowElement',
                name: 'div',
                attributes: [
                  {
                    type: 'mdxJsxAttribute',
                    name: 'class',
                    value: 'c--callout_title',
                  },
                ],
                children: child.children,
              } as unknown as RootContent;
            }
            return child as RootContent;
          });

          // MDXJsxFlowElementに変換（AST ノードを直接書き換え）
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

/**
 * AST ノードからテキストを抽出するヘルパー関数
 */
function extractText(nodes: RootContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return node.value;
      }
      if ('children' in node) {
        return extractText(node.children as RootContent[]);
      }
      return '';
    })
    .join('');
}
