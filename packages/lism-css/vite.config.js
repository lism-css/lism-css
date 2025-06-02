// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';

// import {useRef} from 'react'; とかした時に、React is not defined 言われないように
import react from '@vitejs/plugin-react-swc';
// import svgr from 'vite-plugin-svgr'; // svg を React Component として import できるようにする
// import reactJsx from 'vite-react-jsx';
// import { terser } from 'rollup-plugin-terser'

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
	index: resolve(__dirname, 'src/components/index.js'),
	// 'components/Box/index': resolve(__dirname, 'src/components/Box/index.js'),
	config: resolve(__dirname, 'src/config/index.js'),
	// ↓ scripts.jsのビルドと、setEvent.js もこれでビルドされる.
	'scripts/tabs': resolve(__dirname, 'src/components/Tabs/script.js'),
	'scripts/accordion': resolve(__dirname, 'src/components/Accordion/script.js'),
	'scripts/modal': resolve(__dirname, 'src/components/Modal/script.js'),
};

// build.lib を設定すると でライブラリモードになる。
// https://ja.vitejs.dev/guide/build.html#library-mode
export default defineConfig({
	plugins: [react()],
	resolve: {
		// ここでこれやると外部からの import でエラーになる
		// alias: [{ find: '@/', replacement: '/src/' }],
	},
	build: {
		// target: 'es2015',
		lib: {
			// 複数のエントリーポイントのディクショナリや配列にもできます
			entry: entries,

			// name は公開されているグローバル変数で、formats に 'umd' や 'iife' が含まれている場合に必要です。
			// name: 'Lism',

			// デフォルトの formats は ['es', 'umd']で、複数のエントリを使用する場合は ['es', 'cjs']
			// formats: ['es', 'cjs'],
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
			external: ['react'],
			// umd/iife バンドルの外部インポートに必要な id:variableName ペアを指定します。
			// globals: {
			// 	react: 'React',
			// 	'react-dom': 'ReactDOM',
			// },
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
				// entryFileNames: (chunkInfo) => {
				// 	console.log('chunkInfo', chunkInfo);
				// 	//fileName に components が含まれているかチェックする
				// 	// if (fileName.indexOf('components') !== -1) {
				// 	// 	// 重複するディレクトリ構造を削除する
				// 	// 	const componentPath = deleteDuplicateDir(fileName);
				// 	// 	return `${componentPath}/index.js`;
				// 	// } else {
				// 	// 	// console.log('fileName', fileName);
				// 	// 	return `${fileName}.js`;
				// 	// }
				// 	return `${chunkInfo.name}.js`;
				// 	// return `[format]/${chunkInfo.name}.js`;
				// },
			},
			// plugins: [
			// 	terser({
			// 		compress: false,
			// 		mangle: false,
			// 	})
			// ]
		},
	},
});
