import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import remarkDirective from 'remark-directive';
import { remarkDirectiveHandler } from './src/lib/remark-directive.mjs';
import { remarkLinkCard } from './src/lib/remark-link-card.mjs';
import { remarkWikiLink } from './src/lib/remark-wiki-link.mjs';

export default defineConfig({
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
  ],
  markdown: {
    // :::note などの directive 記法を <Callout> に変換
    // URL単独段落/[[slug]]単独段落 → <LinkCard />、文中の[[slug]] → <WikiLink />
    remarkPlugins: [remarkDirective, remarkDirectiveHandler, remarkLinkCard, remarkWikiLink],
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
