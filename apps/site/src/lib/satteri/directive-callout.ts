/**
 * Sätteri の directive 記法（`features.directive`）を処理する MDAST プラグイン。
 *
 * 1. `:::type`（containerDirective）を `<Callout type>` に変換する。
 *    直下の `::title[...]`（leafDirective）は `div.c--docsNote_title` にする。
 * 2. 未使用の `:name`（textDirective）は元のテキストへ戻す。
 *    「1:2」「hover:bg」のような文字列が directive として解釈され、
 *    Sätteri の既定変換で捨てられるのを防ぐ。
 *
 * 入力（MDX）:
 *   :::tip
 *   ::title[タイトル]
 *   本文
 *   :::
 *
 * 出力（JSX 相当）:
 *   <Callout type="tip">
 *     <div class="c--docsNote_title">タイトル</div>
 *     <p>本文</p>
 *   </Callout>
 *
 * 対応する type: alert, point, tip, warning, check, help, note, info
 * 未対応の `:::type` / `::name` はコンパイルエラーにする。
 * Sätteri は未処理の directive を黙って捨てるため、typo を出力の欠落で気付かせない。
 */
import { defineMdastPlugin } from 'satteri';
import type { MdxJsxFlowElement } from 'satteri';
import type { PhrasingContent } from 'mdast';

export const CALLOUT_TYPES = ['alert', 'point', 'tip', 'warning', 'check', 'help', 'note', 'info'] as const;

type DirectiveAttributes = Record<string, string | null | undefined> | null | undefined;

function isCalloutType(name: string): name is (typeof CALLOUT_TYPES)[number] {
  return (CALLOUT_TYPES as readonly string[]).includes(name);
}

function describeFile(fileURL: URL | undefined): string {
  return fileURL ? fileURL.pathname : 'unknown file';
}

function extractText(nodes: readonly PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value;
      if ('children' in node) return extractText(node.children);
      return '';
    })
    .join('');
}

function formatAttributes(attributes: DirectiveAttributes): string {
  const entries = Object.entries(attributes ?? {});
  if (entries.length === 0) return '';
  return `{${entries.map(([key, value]) => (value === '' ? key : `${key}="${String(value)}"`)).join(' ')}}`;
}

export const directiveCallout = defineMdastPlugin({
  name: 'directive-callout',

  containerDirective(node, ctx) {
    if (!isCalloutType(node.name)) {
      throw new Error(`Unknown callout type ":::${node.name}" in ${describeFile(ctx.fileURL)}. Use one of: ${CALLOUT_TYPES.join(', ')}`);
    }
    const callout: MdxJsxFlowElement = {
      type: 'mdxJsxFlowElement',
      name: 'Callout',
      attributes: [{ type: 'mdxJsxAttribute', name: 'type', value: node.name }],
      children: node.children,
    };
    return callout;
  },

  leafDirective(node, ctx) {
    if (node.name !== 'title') {
      throw new Error(`Unknown leaf directive "::${node.name}" in ${describeFile(ctx.fileURL)}. Only "::title[...]" is supported.`);
    }
    const title: MdxJsxFlowElement = {
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [{ type: 'mdxJsxAttribute', name: 'class', value: 'c--docsNote_title' }],
      // タイトルは段落で包まずインライン内容をそのまま置く（型上は block content だが Sätteri はそのまま出力する）
      children: node.children as unknown as MdxJsxFlowElement['children'],
    };
    return title;
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
