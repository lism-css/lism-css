// パッケージ自身の CSS ビルド（tsx 実行）。
// 同梱デフォルトの prop-config を更新しつつ src/scss → dist/css をコンパイルする。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePropConfigFiles, compileCssTree } from '../src/builder/index.ts';
import { CONFIG } from '../config/index.ts';
import { objDeepMerge } from '../config/helper.ts';
import propsFull from '../config/presets/props-full.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scssDir = path.resolve(__dirname, '../src/scss');
const distDir = path.resolve(__dirname, '../dist/css');

// 同梱デフォルトの _prop-config.scss / _prop-config-full.scss を更新する。
// これらは素の sass 利用（@use 'lism-css/scss/setting' 等）が `@use './prop-config'` で読む実ファイル。
// main 系は CONFIG、full 系（isVar系を除く全propsのBPをlgまで拡張）は CONFIG に full preset を反映。
writePropConfigFiles({
  scssDir,
  mainConfig: CONFIG,
  fullConfig: objDeepMerge(CONFIG, { props: propsFull }),
});

// src/scss を直接コンパイル（prop-config はディスク実ファイルを参照）。
await compileCssTree({ scssDir, distDir });
