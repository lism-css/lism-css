import { defineConfig } from 'astro/config';
import { lismCss } from '@lism-css/plugin/astro';

export default defineConfig({
  integrations: [lismCss({ purge: { report: true } })],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
