import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  'builder/index': resolve(__dirname, 'src/builder/index.ts'),
  'builder/vite': resolve(__dirname, 'src/builder/vite.ts'),
  'purge/vite': resolve(__dirname, 'src/purge/vite.ts'),
  'purge/astro': resolve(__dirname, 'src/purge/astro.ts'),
};

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      outDir: 'dist',
      entryRoot: 'src',
    }),
  ],
  test: {
    environment: 'node',
    typecheck: {
      enabled: true,
      exclude: ['**/node_modules/**', '**/.git/**'],
    },
  },
  build: {
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^node:/,
        'lism-css',
        /^lism-css\//,
        'sass',
        'postcss',
        'autoprefixer',
        'cssnano',
        'glob',
        'vite',
        'astro',
      ],
      output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
