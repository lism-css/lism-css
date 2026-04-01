#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import buildConfig from './build-config.js';
import buildCSS from './build-css.js';
import { objDeepMerge } from '../config/helper.js';

// NOTE: build-config.js を実行するための簡易CLIエントリ
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルート取得
const projectRoot = process.cwd();

console.log('🤖 projectRoot:', projectRoot);

// 設定ファイルのパス
const defaultConfigPath = path.resolve(__dirname, '../config/default-config.js');
const userConfigPath = path.resolve(projectRoot, 'lism.config.js');

// コマンドライン引数の先頭をサブコマンドとして解釈（デフォルトは build-config）
const args = process.argv.slice(2);
const command = args[0] || '';

async function main() {
  // 指定がない場合、build-config を実行
  if (command === 'build') {
    // default-config を常に読み込む（ESM default export を取得）
    const defaultConfigModule = await import(pathToFileURL(defaultConfigPath).href);
    const defaultConfig = defaultConfigModule?.default || {};

    // user の lism.config.js は存在する時のみ読み込む
    let userConfig = {};
    if (fs.existsSync(userConfigPath)) {
      const userConfigModule = await import(pathToFileURL(userConfigPath).href);
      userConfig = userConfigModule?.default || {};

      console.log('===== 📁 userConfig =====');
      console.log(userConfig);
      console.log('==========');
    }

    // 設定をディープマージ
    const CONFIG = objDeepMerge(defaultConfig, userConfig);

    // 動的インポートで同ディレクトリのスクリプトを実行
    await buildConfig(CONFIG); // SCSSの設定ファイルを出力
    await buildCSS();
    return;
  }

  if (!command) {
    console.log('Usage: lism-css <command>');
    console.log('  <command>:');
    console.log('    - build : Build the CSS');
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
