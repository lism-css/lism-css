#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { buildCssToDir, loadBuildConfigs } from '../dist/builder/index.js';

// NOTE: lism-css build の簡易CLIエントリ。
// 共有コア（dist/builder）経由で config を読み、CSS をビルドする。
// buildCssToDir は src/scss を一時ディレクトリへ複製して prop-config を差し替えるため、
// node_modules 内 src/scss へのインプレース書き換えは行わない（出力は dist/css）。
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート取得
const projectRoot = process.cwd();

console.log('🤖 projectRoot:', projectRoot);

// コマンドライン引数の先頭をサブコマンドとして解釈
const args = process.argv.slice(2);
const command = args[0] || '';

// build コマンドのオプション。
// --full: full.css / full_no_layer.css も生成・コンパイルする（デフォルトではビルドしない）
const withFull = args.includes('--full');

async function main() {
  if (command === 'build') {
    // config 読み込み（defaults → full preset → lism.config）。
    // mainConfig は isFullMode 時に full preset 適用済み（loadBuildConfigs が解決）。
    const { mainConfig, fullConfig, userConfigPath } = await loadBuildConfigs(projectRoot, {
      distDir: path.resolve(__dirname, '../dist'),
    });

    if (userConfigPath) {
      console.log('===== 📁 userConfig =====');
      console.log(userConfigPath);
      console.log('==========');
    }

    // full 系の生成・コンパイルは --full 指定時のみ行う。
    await buildCssToDir({
      scssDir: path.resolve(__dirname, '../src/scss'),
      distDir: path.resolve(__dirname, '../dist/css'),
      mainConfig,
      fullConfig,
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
