/* eslint no-console: 0 */
const path = require('path');
const fs = require('fs');

// glob
const glob = require('glob');

// node-sass
// const sass = require('node-sass');
const sass = require('sass');
// const globImporter = require('node-sass-glob-importer');

// postcss
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
// const mqpacker = require('css-mqpacker');

// consoleの色付け
const COLOR = {
	red: '\u001b[31m',
	green: '\u001b[32m',
	reset: '\x1b[0m',
};

// 環境変数・引数
// const envTYPE = process.env.TYPE || '';
// const TARGET_DIR = process.argv[2] || '';

(() => {
	// パス
	let src = 'src/scss';
	let dist = 'dist/css';
	compileSCSS(src, dist);

	// component
	src = 'src/components';
	dist = 'dist/components';
	compileSCSS(src, dist);
})();

// scssファイル処理
async function compileSCSS(src, dist) {
	let files = [];
	// files = [src + '/all_with_layout.scss', src + '/all.scss', src + '/reset.scss'];

	const ignore = ['**/_*.scss'];
	files = glob.sync(src + '/**/*.scss', { ignore });

	for (const filePath of files) {
		console.log(COLOR.green + 'Start sassRender: ' + COLOR.reset + filePath);

		const fileName = filePath.replace(src + '/', '');
		const srcPath = path.resolve(__dirname, src, fileName);
		const distPath = path
			.resolve(__dirname, dist, fileName)
			.replace('.scss', '.css')
			.replace('/index.css', '.css');

		// dart sass コンパイル
		try {
			const compiledCSS = sass.compile(srcPath, {
				style: 'expanded', // 圧縮はcssnanoに任せる
			});

			// postcss実行
			postcss([autoprefixer, cssnano])
				.process(compiledCSS.css, { from: undefined })
				.then((postcssResult) => {
					writeCSS(distPath, postcssResult.css);
				});

			// console.log(COLOR.green + 'Completed.');
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
