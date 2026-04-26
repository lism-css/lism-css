/**
 * <head> 内の <title> / <meta name="description"> / <link rel="canonical"> を
 * 抽出して file.data.meta に格納する rehype プラグイン。
 *
 * 後段の rehypeKeepArticle で <head> ごと削られるため、抽出はその前に行う必要がある。
 */
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export type DocMeta = {
  title?: string;
  description?: string;
  url?: string;
};

const TITLE_SUFFIX = /\s*[-–—]\s*Lism CSS\s*$/;

export const META_DATA_KEY = 'docsMdMeta';

export function rehypeExtractMeta() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    const meta: DocMeta = {};

    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'title') {
        const child = node.children[0];
        if (child?.type === 'text') {
          meta.title = child.value.replace(TITLE_SUFFIX, '').trim();
        }
        return;
      }
      if (node.tagName === 'meta' && node.properties?.name === 'description') {
        const content = node.properties.content;
        if (typeof content === 'string') meta.description = content;
        return;
      }
      if (node.tagName === 'link') {
        const rel = node.properties?.rel;
        const isCanonical = Array.isArray(rel) ? rel.includes('canonical') : rel === 'canonical';
        if (isCanonical) {
          const href = node.properties?.href;
          if (typeof href === 'string') meta.url = href;
        }
      }
    });

    file.data[META_DATA_KEY] = meta;
  };
}
