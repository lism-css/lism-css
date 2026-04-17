import { Command } from 'commander';
import { createUiCommand } from './commands/ui/index.js';

/** `lism` エントリの CLI プログラムを構築して返す（parse は呼ばない）。 */
export function createLismProgram(): Command {
  const program = new Command();
  program.name('lism').description('Lism CSS / UI 向け CLI').version('0.1.3');
  program.addCommand(createUiCommand());
  return program;
}
