import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: デプロイ先のドメインに書き換えてください。sitemap や canonical URL に使われます。
  site: 'https://example.com/',
  integrations: [sitemap()],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
