import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { satteri } from '@astrojs/markdown-satteri';
import { lismCss } from '@lism-css/plugin/astro';
import { directive } from './src/lib/satteri/directive.mjs';
import { linkCard } from './src/lib/satteri/link-card.mjs';
import { wikiLink } from './src/lib/satteri/wiki-link.mjs';
import { headingAnchor } from './src/lib/satteri/heading-anchor.mjs';
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
    lismCss({ purge: { report: true } }),
  ],
  markdown: {
    processor: satteri({
      features: {
        // :::type 記法を directive で解析する
        directive: true,
        // 本文中の `--`（b-- / c-- などのクラス名）をダッシュに変換しない。引用符と省略記号の変換は既定のまま
        smartPunctuation: { dashes: false },
      },
      // :::type[ラベル] → Callout / :::type → Alert、URL 単独段落 → LinkCard、[[slug]] → LinkCard / WikiLink
      mdastPlugins: [directive, linkCard, wikiLink],
      // 見出し ID と h2 / h3 の #アンカーリンク
      hastPlugins: [headingAnchor],
    }),
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
