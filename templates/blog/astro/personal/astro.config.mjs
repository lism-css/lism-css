import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadPostLastmodMap } from './src/lib/sitemap-lastmod.mjs';

const postLastmodMap = loadPostLastmodMap({
  postsDir: new URL('./src/posts/', import.meta.url),
});

export default defineConfig({
  // TODO: デプロイ先のドメインに書き換えてください。sitemap や canonical URL に使われます。
  site: 'https://example.com/',
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = postLastmodMap.get(new URL(item.url).pathname);
        if (lastmod) {
          item.lastmod = lastmod;
        }
        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
