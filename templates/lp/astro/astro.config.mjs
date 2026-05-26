import { defineConfig } from 'astro/config';
import { lismPurgeAstro } from 'lism-css/purge/astro';

export default defineConfig({
  integrations: [lismPurgeAstro({ report: true })],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
