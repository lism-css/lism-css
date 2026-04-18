import { createLismProgram } from './createProgram.js';
import { preScanLang } from './i18n.js';

// --help 出力や description の評価は parse 前に確定するため、
// argv から --lang を先に抽出して言語を設定してから CLI を構築する。
preScanLang(process.argv.slice(2));
const program = createLismProgram();
program.parse();
