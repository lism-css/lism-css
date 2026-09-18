import { resolve } from 'path';
import { getViteConfig } from 'astro/config';

// Astroコンポーネントはjsdomでは描画できないため、node環境の別プロジェクトとして実行する（vite.config.js の test.projects から参照）
export default getViteConfig(
  {
    root: __dirname,
    resolve: {
      // Astroコンポーネントが参照する lism-css/* を dist ではなく src へ向け、ビルド前のソースをテストする
      alias: [
        { find: /^lism-css\/lib\/(.*)$/, replacement: resolve(__dirname, 'src/lib/$1') },
        { find: /^lism-css\/react\/(.*)$/, replacement: resolve(__dirname, 'src/components/$1') },
      ],
    },
    test: {
      name: 'astro',
      root: __dirname,
      environment: 'node',
      include: ['packages/astro/**/*.test.ts'],
    },
  },
  { logLevel: 'error' }
);
