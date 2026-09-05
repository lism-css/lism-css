// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// import {useRef} from 'react'; とかした時に、React is not defined 言われないように
import react from '@vitejs/plugin-react-swc';
// import { lismResolver } from './plugins/lism-resolver.js';

// components/Box/Box → components/Box/index に変換
function deleteDuplicateDir(filePath) {
  const componentDir = filePath.split('/').slice(-1)[0];

  // 正規表現でパターンを作成
  const regex = new RegExp(`${componentDir}/${componentDir}$`);

  // ファイルパスが指定したパターンと一致するか確認
  if (regex.test(filePath)) {
    // 一致する場合、パス中の最後のコンポーネント名を "index" に置換
    const newPath = filePath.replace(regex, componentDir);
    return newPath + '/index';
  }

  // 一致しない場合、元のパスをそのまま返す
  return filePath;
}

// front用のスクリプトファイルのビルドは要検討

// ファイルパスは大文字・小文字まで一致しないと Vercel でこけるので注意。
const entries = {
  // 'components/index': resolve(__dirname, 'src/components/index.ts'),
  'components/react': resolve(__dirname, 'src/components/react.ts'),

  // ↓ scripts.jsのビルドと、setEvent.js もこれでビルドされる.
  'scripts/tabs': resolve(__dirname, 'src/components/Tabs/script.ts'),
  'scripts/accordion': resolve(__dirname, 'src/components/Accordion/script.ts'),
  'scripts/modal': resolve(__dirname, 'src/components/Modal/script.ts'),
  'scripts/tooltip': resolve(__dirname, 'src/components/Tooltip/script.ts'),
};

// build.lib を設定すると でライブラリモードになる。
// https://ja.vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.json',
      outDir: 'dist',
      entryRoot: 'src',
    }),
  ],
  build: {
    // target: 'es2015',
    lib: {
      // 複数のエントリーポイントのディクショナリや配列にもできます
      entry: entries,

      // name は公開されているグローバル変数で、formats に 'umd' や 'iife' が含まれている場合に必要です。
      // name: 'Lism',

      // デフォルトの formats は ['es', 'umd']で、複数のエントリを使用する場合は ['es', 'cjs']
      formats: ['es'],

      // 適切な拡張子が追加されます
      // fileName: 'index',
      // fileName: ( format, entryName ) => {
      // 	console.log('entryName', entryName);
      // 	// return `${format}/${entryName}/index.js`;
      // 	return `${entryName}.js`;
      // },
    },
    rollupOptions: {
      plugins: [preserveDirectives()],
      // lism-css 本体は dependencies として利用側で解決させる（バンドルするとトークン・CONFIG の
      // スナップショットが焼き込まれ、lism-css/react と併用時にランタイムが2重になる）。
      // lism-css/config.js は @lism-css/plugin が利用者の lism.config へ alias する差し替え点なので単独でも external に残す。
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lism-css/config.js', /^lism-css(\/|$)/],
      output: {
        dir: 'dist',
        // exports: 'named',
        preserveModules: true, // モジュールツリーの構造を保持する
        preserveModulesRoot: 'src',
        entryFileNames: (chunkInfo) => {
          // console.log('chunkInfo', chunkInfo);
          const fileName = chunkInfo.name;

          //fileName に components が含まれている場合
          if (fileName.indexOf('components') !== -1) {
            // 重複するディレクトリ構造を削除して返す
            const componentPath = deleteDuplicateDir(fileName);
            return `${componentPath}.js`;
          }
          return `${fileName}.js`;
        },
      },
    },
  },
});
