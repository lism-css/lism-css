import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import remarkDirective from 'remark-directive';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { lismPurgeAstro } from 'lism-css/purge';
import { remarkDirectiveHandler } from './src/lib/remark-directive.mjs';
import { remarkLinkCard } from './src/lib/remark-link-card.mjs';
import { remarkWikiLink } from './src/lib/remark-wiki-link.mjs';
import { loadPostLastmodMap } from './src/lib/sitemap-lastmod.mjs';

const postLastmodMap = loadPostLastmodMap({
  postsDir: new URL('./src/posts/', import.meta.url),
  stripFirstSegment: true,
});

export default defineConfig({
  // TODO: デプロイ先のドメインに書き換えてください。sitemap や canonical URL に使われます。
  site: 'https://example.com/',
  // expressiveCode は mdx より前に置く必要がある
  integrations: [
    expressiveCode({
      // themes: ['github-light', 'github-dark'],
      // themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      themes: 'github-dark',
      defaultProps: { wrap: true },
      styleOverrides: {
        codeFontFamily: 'var(--ff--mono)',
        borderRadius: 'var(--bdrs--10)',
        frames: {
          frameBoxShadowCssValue: 'none',
        },
      },
    }),
    mdx(),
    sitemap({
      serialize(item) {
        const lastmod = postLastmodMap.get(new URL(item.url).pathname);
        if (lastmod) {
          item.lastmod = lastmod;
        }
        return item;
      },
    }),
    lismPurgeAstro({ report: true }),
  ],
  markdown: {
    // :::note などの directive 記法を <Callout> に変換
    // URL単独段落/[[slug]]単独段落 → <LinkCard />、文中の[[slug]] → <WikiLink />
    remarkPlugins: [remarkDirective, remarkDirectiveHandler, remarkLinkCard, remarkWikiLink],
    // h2/h3 見出しに #アンカーリンクを追加
    // MDX integration の rehypeHeadingIds はユーザープラグインより後に走るため、明示的に先に追加
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            class: 'c--headingAnchor',
            ariaLabel: 'Link to this section',
          },
          // "#" は CSS の ::after で描画する。アンカー本体にテキストを入れないことで、
          // MDX integration が後段で再実行する rehypeHeadingIds の text 抽出に "#" が混入するのを防ぐ
          content: [],
          test: (node) => ['h2', 'h3'].includes(node.tagName),
        },
      ],
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
