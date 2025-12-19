/* eslint no-console: 0 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// glob（CJS互換モジュールだが、ESM からもデフォルト import で利用可能）
import { globSync } from 'glob';

// dart-sass
// import legacySass from 'node-sass';
import * as sass from 'sass';

// postcss
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// console の色付け
const COLOR = {
	red: '\u001b[31m',
	green: '\u001b[32m',
	reset: '\x1b[0m',
};

// __dirname（ESM）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// scssファイル処理
export async function compileSCSS(src, dist) {
	let files = [];

	// NOTE: CLI 経由で実行されると cwd がプロジェクト側になるため、
	// glob の ignore が相対解決されずに全件ヒットすることがある。
	// cwd を明示してパターンを相対指定、absolute で絶対パスを受け取る。
	const ignore = ['**/_*.scss'];
	files = globSync('**/*.scss', { cwd: src, ignore, absolute: true });

	console.log('▶️ [compileSCSS] files:', files);

	for (const filePath of files) {
		// console.log(COLOR.green + 'Start sassRender: ' + COLOR.reset + filePath);

		const fileName = filePath.replace(src + '/', '');
		const srcPath = path.resolve(__dirname, src, fileName);
		const distPath = path.resolve(__dirname, dist, fileName).replace('.scss', '.css').replace('/index.css', '.css');

		try {
			// dart sass コンパイル（同期処理）
			const compiledCSS = sass.compile(srcPath, {
				style: 'expanded', // 圧縮は cssnano に任せる
			});

			// postcss 実行（完了まで await）
			const postcssResult = await postcss([autoprefixer, cssnano]).process(compiledCSS.css, { from: undefined });
			writeCSS(distPath, postcssResult.css);
		} catch (error) {
			console.log(COLOR.red + '\n========== ! ERROR ==========' + COLOR.reset);
			console.log(error);
			console.log(COLOR.red + '========== / ERROR ========== \n' + COLOR.reset);
		}
	}
}

// 書き出し処理
function writeCSS(filePath, css) {
	const dir = path.dirname(filePath);

	// ディレクトリがなければ作成
	if (!fs.existsSync(dir)) {
		console.log('mkdir ' + dir);
		fs.mkdirSync(dir, { recursive: true });
	}

	// css書き出し
	fs.writeFileSync(filePath, css);
}

// デフォルトエクスポート（他から await 可能）
export default async function buildCSS() {
	// パス（絶対パスに変換）
	let src = path.resolve(__dirname, '../src/scss');
	let dist = path.resolve(__dirname, '../dist/css');
	await compileSCSS(src, dist);

	// component
	// src = path.resolve(__dirname, '../src/components');
	// dist = path.resolve(__dirname, '../dist/components');
	// await compileSCSS(src, dist);
}
