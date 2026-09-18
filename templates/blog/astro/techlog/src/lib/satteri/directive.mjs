/**
 * Sätteri の directive 記法（`features.directive`）を Callout / Alert に変換する MDAST プラグイン。
 *
 *   :::tip[ヒント]      →  <Callout type="tip" title="ヒント">本文</Callout>
 *   :::tip              →  <Alert type="tip">本文</Alert>
 *
 * 対応する type: alert, point, tip, warning, check, help, note, info
 * 未対応の `:::type` / `::name` はコンパイルエラーにする
 * （Sätteri は未処理の directive を黙って捨てるため、typo を出力の欠落で気付かせない）。
 * 文中の `:name`（textDirective）は元のテキストへ戻す（`1:2` などの誤検出対策）。
 */
import { defineMdastPlugin } from 'satteri';

const DIRECTIVE_TYPES = ['alert', 'point', 'tip', 'warning', 'check', 'help', 'note', 'info'];

function describeFile(fileURL) {
  return fileURL ? fileURL.pathname : 'unknown file';
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

function formatAttributes(attributes) {
  const entries = Object.entries(attributes ?? {});
  if (entries.length === 0) return '';
  return `{${entries.map(([key, value]) => (value === '' ? key : `${key}="${String(value)}"`)).join(' ')}}`;
}

export const directive = defineMdastPlugin({
  name: 'directive',

  containerDirective(node, ctx) {
    if (!DIRECTIVE_TYPES.includes(node.name)) {
      throw new Error(`Unknown directive type ":::${node.name}" in ${describeFile(ctx.fileURL)}. Use one of: ${DIRECTIVE_TYPES.join(', ')}`);
    }

    // ラベル（:::type[ラベル]）は先頭の paragraph + data.directiveLabel で表現される
    const children = [...node.children];
    const first = children[0];
    const hasLabel = first?.type === 'paragraph' && first.data?.directiveLabel === true;

    const attributes = [{ type: 'mdxJsxAttribute', name: 'type', value: node.name }];
    if (hasLabel) {
      attributes.push({ type: 'mdxJsxAttribute', name: 'title', value: extractText(first.children) });
      children.shift();
    }

    return {
      type: 'mdxJsxFlowElement',
      name: hasLabel ? 'Callout' : 'Alert',
      attributes,
      children,
    };
  },

  leafDirective(node, ctx) {
    throw new Error(`Leaf directive "::${node.name}" in ${describeFile(ctx.fileURL)} is not supported.`);
  },

  textDirective(node) {
    let restored = `:${node.name}`;
    if (node.children.length > 0) {
      restored += `[${extractText(node.children)}]`;
    }
    restored += formatAttributes(node.attributes);
    return { type: 'text', value: restored };
  },
});
