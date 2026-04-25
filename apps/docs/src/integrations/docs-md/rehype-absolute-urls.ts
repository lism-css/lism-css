/**
 * ルート相対パス（`/foo/bar`）の href / src を絶対 URL に展開する rehype プラグイン。
 * 既に絶対 URL / プロトコル相対 / アンカー / `mailto:` 等のスキーム付きは触らない。
 * `./` `../` 形式は MDX のビルド時にルート相対へ正規化されるため非対応。
 */
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

const URL_ATTRS: Record<string, string[]> = {
  a: ['href'],
  area: ['href'],
  link: ['href'],
  img: ['src', 'srcset'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  iframe: ['src'],
};

const SKIP_SCHEME = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export function rehypeAbsoluteUrls(opts: { siteUrl: string }) {
  const base = opts.siteUrl;
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const attrs = URL_ATTRS[node.tagName];
      if (!attrs || !node.properties) return;
      for (const attr of attrs) {
        const v = node.properties[attr];
        if (typeof v !== 'string' || v === '') continue;
        node.properties[attr] = attr === 'srcset' ? absolutizeSrcset(v, base) : absolutize(v, base);
      }
    });
  };
}

export function absolutize(url: string, base: string): string {
  if (SKIP_SCHEME.test(url)) return url;
  if (!url.startsWith('/')) return url;
  return new URL(url, base).toString();
}

// `srcset` は `url 1x, url 2x` 形式のためカンマ区切りで個別展開する
function absolutizeSrcset(srcset: string, base: string): string {
  return srcset
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return trimmed;
      const [url, ...rest] = trimmed.split(/\s+/);
      return [absolutize(url, base), ...rest].join(' ');
    })
    .join(', ');
}
