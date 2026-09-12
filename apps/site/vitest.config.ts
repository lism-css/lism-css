import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// tsconfig / astro.config のパスエイリアスと揃える
export default defineConfig({
  resolve: {
    alias: {
      '@parts': fileURLToPath(new URL('./src/components/parts', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/components/ui', import.meta.url)),
      '@templates': fileURLToPath(new URL('../../templates', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
