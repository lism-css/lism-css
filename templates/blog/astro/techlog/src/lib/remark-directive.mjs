/**
 * remark-directive で解析された directive を Callout / Alert に変換するプラグイン
 *
 * 例:
 *   :::tip[ヒント]
 *   本文
 *   :::
 *   →  <Callout type="tip" title="ヒント">本文</Callout>
 *
 *   :::tip
 *   本文
 *   :::
 *   →  <Alert type="tip">本文</Alert>
 *
 * ラベル（:::type[ラベル]）あり → Callout、ラベルなし → Alert に振り分ける。
 * 対応する type: alert, point, tip, warning, check, help, note, info
 *
 * また、本文中に `:foo` のような textDirective が紛れた場合は元のテキストへ復元する
 * （remark-directive がコロン記法を意図せず directive として解釈するのを防ぐ）。
 */
import { visit } from 'unist-util-visit';

const DIRECTIVE_TYPES = ['alert', 'point', 'tip', 'warning', 'check', 'help', 'note', 'info'];

export function remarkDirectiveHandler() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      // textDirective（:name 記法）はこのテンプレートでは使わないので元のテキストに戻す
      if (node.type === 'textDirective') {
        if (index === undefined || !parent) return;

        let restored = `:${node.name}`;
        if (node.children?.length > 0) {
          restored += `[${extractText(node.children)}]`;
        }
        if (node.attributes && Object.keys(node.attributes).length > 0) {
          const attrs = Object.entries(node.attributes)
            .map(([key, value]) => (value === '' ? key : `${key}="${String(value)}"`))
            .join(' ');
          restored += `{${attrs}}`;
        }
        parent.children.splice(index, 1, { type: 'text', value: restored });
        return;
      }

      // containerDirective（:::type）をラベル有無で Callout / Alert に振り分け
      if (node.type === 'containerDirective') {
        const directiveName = node.name;
        if (!DIRECTIVE_TYPES.includes(directiveName)) return;

        // remark-directive ではラベルが先頭の paragraph + data.directiveLabel で表現される
        const children = [...node.children];
        const first = children[0];
        const hasLabel = first?.type === 'paragraph' && first.data?.directiveLabel;

        const attributes = [
          {
            type: 'mdxJsxAttribute',
            name: 'type',
            value: directiveName,
          },
        ];

        if (hasLabel) {
          // ラベルあり → Callout の title prop に渡す
          const labelText = extractText(first.children);
          attributes.push({
            type: 'mdxJsxAttribute',
            name: 'title',
            value: labelText,
          });
          children.shift();
        }

        node.type = 'mdxJsxFlowElement';
        node.name = hasLabel ? 'Callout' : 'Alert';
        node.attributes = attributes;
        node.children = children;
      }
    });
  };
}

function extractText(nodes) {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value;
      if ('children' in node) return extractText(node.children);
      return '';
    })
    .join('');
}
