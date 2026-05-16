import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import { remarkDirectiveHandler } from './src/lib/remark-directive.mjs';
import { remarkLinkCard } from './src/lib/remark-link-card.mjs';
import { remarkWikiLink } from './src/lib/remark-wiki-link.mjs';

export default defineConfig({
  integrations: [mdx()],
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
