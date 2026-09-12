import { describe, it, expect } from 'vitest';
import type { Root, Element } from 'hast';
import { rehypeDocsLink } from './rehype-docs-link';

function runPlugin(node: Element): Element {
  const tree: Root = { type: 'root', children: [node] };
  rehypeDocsLink()(tree);
  return tree.children[0] as Element;
}

interface DocsLinkProps {
  href: string;
  title?: string;
  description?: string;
  arrow?: boolean;
}

function makeDocsLink({ href, title, description, arrow }: DocsLinkProps): Element {
  const children: Element[] = [];

  // 装飾アイコン（左）
  children.push({
    type: 'element',
    tagName: 'div',
    properties: { className: ['c--docsLink_icon'] },
    children: [{ type: 'element', tagName: 'svg', properties: {}, children: [] }],
  });

  // コンテンツ領域（タイトル + 説明）
  const contentChildren: Element[] = [];
  if (title !== undefined) {
    contentChildren.push({
      type: 'element',
      tagName: 'div',
      properties: { className: ['c--docsLink_head'] },
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['c--docsLink_title'] },
          children: [{ type: 'text', value: title }],
        },
      ],
    });
  }
  if (description !== undefined) {
    contentChildren.push({
      type: 'element',
      tagName: 'p',
      properties: { className: ['c--docsLink_description'] },
      children: [{ type: 'text', value: description }],
    });
  }
  children.push({
    type: 'element',
    tagName: 'div',
    properties: { className: ['c--docsLink_content'] },
    children: contentChildren,
  });

  // 矢印アイコン（右）
  if (arrow) {
    children.push({
      type: 'element',
      tagName: 'svg',
      properties: { className: ['c--docsLink_arrow'] },
      children: [],
    });
  }

  return {
    type: 'element',
    tagName: 'a',
    properties: { className: ['c--docsLink'], href },
    children,
  };
}

describe('rehypeDocsLink', () => {
  it('a.c--docsLink の中身をタイトル文字列のみに畳み込む', () => {
    const el = runPlugin(
      makeDocsLink({
        href: '/docs/features',
        title: 'Lism CSSの特徴',
        description: 'Lism CSS の設計思想と主な特徴について詳しく解説します。',
        arrow: true,
      })
    );

    expect(el.children).toEqual([{ type: 'text', value: 'Lism CSSの特徴' }]);
    expect(el.properties?.href).toBe('/docs/features');
  });

  it('c--docsLink クラスを持たない <a> は変更しない', () => {
    const original: Element = {
      type: 'element',
      tagName: 'a',
      properties: { className: ['some-other'], href: '/x' },
      children: [{ type: 'text', value: 'hello' }],
    };
    const el = runPlugin(original);
    expect(el.children).toEqual([{ type: 'text', value: 'hello' }]);
  });

  it('タイトル要素が存在しない場合は構造を温存する（保険）', () => {
    const el = runPlugin(makeDocsLink({ href: '/foo' }));
    // 元の icon / content 構造が残る
    expect(el.children.length).toBeGreaterThan(0);
    expect(el.children[0]).toMatchObject({ tagName: 'div' });
  });

  it('タイトルテキストの前後の空白は除去される', () => {
    const el = runPlugin(
      makeDocsLink({
        href: '/foo',
        title: '  Padded Title  ',
        description: 'desc',
      })
    );
    expect(el.children).toEqual([{ type: 'text', value: 'Padded Title' }]);
  });
});
