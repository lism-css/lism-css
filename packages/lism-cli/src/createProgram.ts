import { Command } from 'commander';
import { createUiCommand } from './commands/ui/index.js';
import { createSkillCommand } from './commands/skill/index.js';
import { createCommand } from './commands/create.js';
import { CLI_VERSION } from './version.js';

/** `lism` エントリの CLI プログラムを構築して返す（parse は呼ばない）。 */
export function createLismProgram(): Command {
  const program = new Command();
  program.name('lism').description('Lism CSS / UI 向け CLI').version(CLI_VERSION);

  program
    .command('create')
    .description('examples テンプレートから新規プロジェクトを生成する')
    .argument('[targetDir]', '出力先ディレクトリ')
    .option('-t, --template <name>', '使用するテンプレート名（例: astro-minimal）')
    .option('-f, --force', '既存ディレクトリを強制上書き', false)
    .action(createCommand);

  program.addCommand(createUiCommand());
  program.addCommand(createSkillCommand());
  return program;
}
