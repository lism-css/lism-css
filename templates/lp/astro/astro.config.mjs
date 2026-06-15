import { defineConfig } from 'astro/config';
import { lismCssAstro } from 'lism-css/vite';

export default defineConfig({
  integrations: [lismCssAstro({ purge: { report: true } })],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
