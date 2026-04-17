import { createLismProgram } from './createProgram.js';

/**
 * `lism-ui <args>` の互換エントリ。同一プロセス内で `lism ui <args>` を実行する。
 *
 * サブプロセスを起動しないため、対話プロンプトや stdio が透過して動作する。
 * LISM_UI_SUPPRESS_DEPRECATION=1 で案内を抑制できる。
 */
const originalArgs = process.argv.slice(2);

if (process.env.LISM_UI_SUPPRESS_DEPRECATION !== '1') {
  process.stderr.write('[notice] `lism-ui` は `lism ui` にリネームされました。将来のバージョンで廃止予定です。\n');
}

// Commander は process.argv を参照するため、先頭に `ui` を挿入して `lism ui <args>` として解釈させる
process.argv = [process.argv[0], process.argv[1], 'ui', ...originalArgs];

const program = createLismProgram();
program.parse();
