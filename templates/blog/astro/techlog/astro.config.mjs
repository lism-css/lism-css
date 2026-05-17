import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import remarkDirective from 'remark-directive';
import { remarkDirectiveHandler } from './src/lib/remark-directive.mjs';
import { remarkLinkCard } from './src/lib/remark-link-card.mjs';

export default defineConfig({
  // expressiveCode は mdx より前に置く必要がある
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      defaultProps: { wrap: true },
      styleOverrides: {
        codeFontFamily: 'var(--ff--mono)',
        borderRadius: 'var(--bdrs--xs)',
      },
    }),
    mdx(),
  ],
  markdown: {
    // :::note などの directive 記法を <Callout> に変換
    // URL単独段落 → <LinkCard type="external" />
    remarkPlugins: [remarkDirective, remarkDirectiveHandler, remarkLinkCard],
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
