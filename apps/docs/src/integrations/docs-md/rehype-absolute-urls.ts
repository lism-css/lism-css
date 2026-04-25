/**
 * ルート相対パス（`/foo/bar`）の href / src を絶対 URL に展開する rehype プラグイン。
 * 既に絶対 URL / プロトコル相対 / アンカー / `mailto:` 等のスキーム付きは触らない。
 * `./` `../` 形式は MDX のビルド時にルート相対へ正規化されるため非対応。
 */
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

// hast の property 名は HTML 属性名と異なるキャメルケース（property-information 由来）。
// srcset → srcSet。値は commaSeparated として配列で渡されることが多いが、文字列で来るケースにも備える。
const URL_ATTRS: Record<string, string[]> = {
  a: ['href'],
  area: ['href'],
  link: ['href'],
  img: ['src', 'srcSet'],
  source: ['src', 'srcSet'],
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
        if (v == null) continue;
        if (attr === 'srcSet') {
          if (Array.isArray(v)) {
            node.properties[attr] = v.map((part) => absolutizeSrcsetPart(String(part), base));
          } else if (typeof v === 'string' && v !== '') {
            node.properties[attr] = absolutizeSrcset(v, base);
          }
        } else if (typeof v === 'string' && v !== '') {
          node.properties[attr] = absolutize(v, base);
        }
      }
    });
  };
}

export function absolutize(url: string, base: string): string {
  if (SKIP_SCHEME.test(url)) return url;
  if (!url.startsWith('/')) return url;
  return new URL(url, base).toString();
}

// `url 1x` のような `url + descriptor` 形式の 1 件を絶対 URL 化する
function absolutizeSrcsetPart(part: string, base: string): string {
  const trimmed = part.trim();
  if (!trimmed) return trimmed;
  const [url, ...rest] = trimmed.split(/\s+/);
  return [absolutize(url, base), ...rest].join(' ');
}

// `srcset` 文字列は `url 1x, url 2x` 形式のためカンマ区切りで個別展開する
function absolutizeSrcset(srcset: string, base: string): string {
  return srcset
    .split(',')
    .map((part) => absolutizeSrcsetPart(part, base))
    .join(', ');
}
