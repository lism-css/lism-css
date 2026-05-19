import { defineConfig } from 'astro/config';
import { lismPurgeAstro } from 'lism-css/purge';

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
