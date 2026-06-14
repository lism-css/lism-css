#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { buildCssToDir } from '../dist/builder/index.js';
import { objDeepMerge } from '../dist/config/helper.js';

// NOTE: lism-css build の簡易CLIエントリ。
// 共有コア（dist/builder）経由で CSS をビルドする。
// buildCssToDir は src/scss を一時ディレクトリへ複製して prop-config を差し替えるため、
// node_modules 内 src/scss へのインプレース書き換えは行わない（出力は dist/css）。
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート取得
const projectRoot = process.cwd();

console.log('🤖 projectRoot:', projectRoot);

// 設定ファイルのパス
const defaultConfigPath = path.resolve(__dirname, '../dist/config/default-config.js');

// ユーザー設定ファイルを検索（優先順: .js → .mjs）
const CONFIG_SEARCH = ['lism.config.js', 'lism.config.mjs'];
function findUserConfigPath() {
  for (const name of CONFIG_SEARCH) {
    const abs = path.resolve(projectRoot, name);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}
const userConfigPath = findUserConfigPath();

// コマンドライン引数の先頭をサブコマンドとして解釈（デフォルトは build-config）
const args = process.argv.slice(2);
const command = args[0] || '';

// build コマンドのオプション。
// --full: full.css / full_no_layer.css も生成・コンパイルする（デフォルトではビルドしない）
const withFull = args.includes('--full');

async function main() {
  // 指定がない場合、build-config を実行
  if (command === 'build') {
    // default-config を常に読み込む（ESM default export を取得）
    const defaultConfigModule = await import(pathToFileURL(defaultConfigPath).href);
    const defaultConfig = defaultConfigModule?.default || {};

    // user の lism.config.{js,mjs} は存在する時のみ読み込む
    let userConfig = {};
    if (userConfigPath) {
      const userConfigModule = await import(pathToFileURL(userConfigPath).href);
      userConfig = userConfigModule?.default || {};

      console.log('===== 📁 userConfig =====');
      console.log(userConfig);
      console.log('==========');
    }

    // 設定をディープマージ
    const CONFIG = objDeepMerge(defaultConfig, userConfig);

    // full.css 用 preset を反映した設定。(later wins): defaults → full preset → user config
    const propsFullPath = path.resolve(__dirname, '../dist/config/presets/props-full.js');
    const propsFullModule = await import(pathToFileURL(propsFullPath).href);
    if (!propsFullModule.default) {
      // 空のまま進めると「full ではない full.css」が黙って生成されるため、明示的にエラーにする
      throw new Error(`props-full preset の読み込みに失敗しました: ${propsFullPath}`);
    }
    const CONFIG_FULL = objDeepMerge(objDeepMerge(defaultConfig, { props: propsFullModule.default }), userConfig);

    // isFullMode 時は main.css 側のビルドにも full preset を適用する。
    // コンポーネント側（config/index.ts）が full 設定でクラスを出力するため、ビルド済みCSSと一致させる必要がある。
    const isFullMode = !!userConfig.isFullMode;

    // full 系の生成・コンパイルは --full 指定時のみ行う。
    await buildCssToDir({
      scssDir: path.resolve(__dirname, '../src/scss'),
      distDir: path.resolve(__dirname, '../dist/css'),
      mainConfig: isFullMode ? CONFIG_FULL : CONFIG,
      fullConfig: CONFIG_FULL,
      ignore: withFull ? [] : ['full.scss', 'full_no_layer.scss'],
    });
    return;
  }

  if (!command) {
    console.log('Usage: lism-css <command> [options]');
    console.log('  <command>:');
    console.log('    - build : Build the CSS');
    console.log('  [options]:');
    console.log('    --full : Also build full.css / full_no_layer.css');
    return;
  }

  // 未知のサブコマンドはエラー表示
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

main().catch((error) => {
  // 例外は標準エラー出力に流して終了コード1で終了
  console.error(error);
  process.exit(1);
});
