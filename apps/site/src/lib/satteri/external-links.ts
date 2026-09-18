/**
 * 外部リンクを別タブで開くようにする HAST プラグイン。
 * rehype-external-links の既定判定（http / https の絶対 URL とプロトコル相対 URL）を踏襲する。
 *
 * 入力: <a href="https://example.com">…</a>
 * 出力: <a href="https://example.com" rel="noopener noreferrer" target="_blank">…</a>
 */
import { defineHastPlugin } from 'satteri';

const PROTOCOLS = ['http', 'https'];
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;

function isExternal(href: string): boolean {
  if (SCHEME_PATTERN.test(href)) {
    return PROTOCOLS.includes(href.slice(0, href.indexOf(':')));
  }
  return href.startsWith('//');
}

export const externalLinks = defineHastPlugin({
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || !isExternal(href)) return;
      // rehype-external-links と同じ属性順（rel → target）で出力する
      ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
      ctx.setProperty(node, 'target', '_blank');
    },
  },
});
