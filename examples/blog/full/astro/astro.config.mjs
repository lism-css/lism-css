import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import { remarkDirectiveHandler } from './src/lib/remark-directive.mjs';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    // :::note などの directive 記法を <Callout> に変換
    remarkPlugins: [remarkDirective, remarkDirectiveHandler],
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
