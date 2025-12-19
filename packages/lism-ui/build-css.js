import path from 'path';
import { fileURLToPath } from 'url';
import { compileSCSS } from 'lism-css/bin/build-css.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// デフォルトエクスポート（他から await 可能）
async function buildCSS() {
	// パス（絶対パスに変換）
	let src = path.resolve(__dirname, './src');
	let dist = path.resolve(__dirname, './dist/');

	await compileSCSS(src, dist);
}

buildCSS();
