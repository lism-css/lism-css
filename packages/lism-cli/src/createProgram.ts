import { Command } from 'commander';
import { createUiCommand } from './commands/ui/index.js';
import { createSkillCommand } from './commands/skill/index.js';
import { createCommand } from './commands/create.js';
import { CLI_VERSION } from './version.js';
import { setLang, t } from './i18n.js';

/** `lism` エントリの CLI プログラムを構築して返す（parse は呼ばない）。 */
export function createLismProgram(): Command {
  const program = new Command();
  program.name('lism').description(t('cli.description')).version(CLI_VERSION).option('--lang <code>', t('cli.opt.lang'));

  // `--lang` が指定されたら各コマンド実行直前に言語を切り替える。
  // commander は --lang をルートプログラムで解釈するため、サブコマンドからも opts() で取れる。
  program.hook('preAction', (thisCommand) => {
    const opts: Record<string, unknown> = thisCommand.optsWithGlobals();
    const lang = opts.lang;
    if (typeof lang === 'string') setLang(lang);
  });

  program
    .command('create')
    .description(t('cli.create.description'))
    .argument('[targetDir]', t('cli.create.arg.targetDir'))
    .option('-t, --template <name>', t('cli.create.opt.template'))
    .option('-f, --force', t('cli.create.opt.force'), false)
    .action(createCommand);

  program.addCommand(createUiCommand());
  program.addCommand(createSkillCommand());
  return program;
}
