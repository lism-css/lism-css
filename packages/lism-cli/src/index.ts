import { createLismProgram } from './createProgram.js';
import { preScanLang } from './i18n.js';
import { logger } from './logger.js';

// --help 出力や description の評価は parse 前に確定するため、
// argv から --lang を先に抽出して言語を設定してから CLI を構築する。
preScanLang(process.argv.slice(2));
const program = createLismProgram();

// async な action の rejection をここで一括処理する（個別コマンドでは catch しない）。#500
program.parseAsync().catch((err: unknown) => {
  // プロンプトの Ctrl+C 中断はユーザーの意思なので、何も表示せず SIGINT 慣例の 130 で終了する
  if (err instanceof Error && err.name === 'ExitPromptError') process.exit(130);
  logger.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
