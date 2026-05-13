/**
 * Obsidian 流の `[[slug]]` / `[[slug|表示テキスト]]` 記法を変換する remark プラグイン。
 *
 * - 段落単独の `[[slug]]`（エイリアスなし）→ `<LinkCardInternal slug="..." />`
 * - 段落単独の `[[slug|alias]]`            → `<PostLink slug="..." text="alias" />` （リンクのまま）
 * - 文中の `[[slug]]` / `[[slug|alias]]`    → `<PostLink slug="..." [text="alias"] />`
 *
 * いずれもタイトル等は受け側のコンポーネントが Content Collections から解決する。
 */
import { visit } from 'unist-util-visit';

const WIKI_LINK_PATTERN = /\[\[([^[\]|]+?)(?:\|([^[\]]+?))?\]\]/g;
const STANDALONE_PATTERN = /^\[\[([^[\]|]+?)\]\]$/;

export function remarkWikiLink() {
  return (tree) => {
    // 1. 段落単独の `[[slug]]`（エイリアスなし）を <LinkCardInternal> に置換
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.children.length !== 1) return;

      const child = node.children[0];
      if (child.type !== 'text') return;

      const match = child.value.trim().match(STANDALONE_PATTERN);
      if (!match) return;

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'LinkCardInternal',
        attributes: [{ type: 'mdxJsxAttribute', name: 'slug', value: match[1].trim() }],
        children: [],
      };
    });

    // 2. テキスト中の `[[slug]]` / `[[slug|alias]]` を <PostLink> に分割
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes('[[')) return;

      const matches = [...node.value.matchAll(WIKI_LINK_PATTERN)];
      if (matches.length === 0) return;

      const segments = [];
      let lastEnd = 0;
      for (const m of matches) {
        const [full, slug, alias] = m;
        const start = m.index;
        if (start > lastEnd) {
          segments.push({ type: 'text', value: node.value.slice(lastEnd, start) });
        }
        const attributes = [{ type: 'mdxJsxAttribute', name: 'slug', value: slug.trim() }];
        if (alias) {
          attributes.push({ type: 'mdxJsxAttribute', name: 'text', value: alias.trim() });
        }
        segments.push({
          type: 'mdxJsxTextElement',
          name: 'PostLink',
          attributes,
          children: [],
        });
        lastEnd = start + full.length;
      }
      if (lastEnd < node.value.length) {
        segments.push({ type: 'text', value: node.value.slice(lastEnd) });
      }

      parent.children.splice(index, 1, ...segments);
      return index + segments.length;
    });
  };
}
