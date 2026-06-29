import path from 'path';
import { fileURLToPath } from 'url';
// P1 で bin/build-css.js（compileSCSS）は共有コアへ統合された。
// compileCssTree が同等（`**/*.scss` を `_*` 除外で glob し autoprefixer + cssnano でコンパイル）。
import { compileCssTree } from '@lism-css/plugin/builder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// デフォルトエクスポート（他から await 可能）
async function buildCSS() {
  // パス（絶対パスに変換）
  const scssDir = path.resolve(__dirname, './src');
  const distDir = path.resolve(__dirname, './dist/');

  await compileCssTree({ scssDir, distDir });
}

buildCSS();
