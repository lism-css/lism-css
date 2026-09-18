/**
 * Obsidian 流の `[[slug]]` / `[[slug|表示テキスト]]` 記法を変換する MDAST プラグイン。
 *
 * - 段落単独の `[[slug]]`（エイリアスなし）→ `<LinkCard type="internal" href="..." />`
 * - 文中の `[[slug]]` / `[[slug|alias]]`    → `<WikiLink slug="..." [text="alias"] />`
 *
 * タイトル等は受け側のコンポーネントが Content Collections から解決する。
 */
import { defineMdastPlugin } from 'satteri';

const WIKI_LINK_PATTERN = /\[\[([^[\]|]+?)(?:\|([^[\]]+?))?\]\]/g;
const STANDALONE_PATTERN = /^\[\[([^[\]|]+?)\]\]$/;

function matchStandalone(paragraph) {
  if (paragraph.children.length !== 1) return null;
  const child = paragraph.children[0];
  if (child.type !== 'text') return null;
  return child.value.trim().match(STANDALONE_PATTERN);
}

export const wikiLink = defineMdastPlugin({
  name: 'wiki-link',

  paragraph(node) {
    const match = matchStandalone(node);
    if (!match) return;
    return {
      type: 'mdxJsxFlowElement',
      name: 'LinkCard',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'type', value: 'internal' },
        { type: 'mdxJsxAttribute', name: 'href', value: match[1].trim() },
      ],
      children: [],
    };
  },

  text(node, ctx) {
    if (!node.value.includes('[[')) return;
    // 段落単独の `[[slug]]` は paragraph visitor が LinkCard に置換済み
    const parent = ctx.parent(node);
    if (parent?.type === 'paragraph' && matchStandalone(parent)) return;

    const matches = [...node.value.matchAll(WIKI_LINK_PATTERN)];
    if (matches.length === 0) return;

    const segments = [];
    let lastEnd = 0;
    for (const m of matches) {
      const [full, slug, alias] = m;
      if (m.index > lastEnd) {
        segments.push({ type: 'text', value: node.value.slice(lastEnd, m.index) });
      }
      const attributes = [{ type: 'mdxJsxAttribute', name: 'slug', value: slug.trim() }];
      if (alias) {
        attributes.push({ type: 'mdxJsxAttribute', name: 'text', value: alias.trim() });
      }
      segments.push({ type: 'mdxJsxTextElement', name: 'WikiLink', attributes, children: [] });
      lastEnd = m.index + full.length;
    }
    if (lastEnd < node.value.length) {
      segments.push({ type: 'text', value: node.value.slice(lastEnd) });
    }
    ctx.replaceNode(node, segments);
  },
});
