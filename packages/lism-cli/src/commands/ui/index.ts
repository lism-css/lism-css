import { Command, Option } from 'commander';
import { addCommand } from './add.js';
import { listCommand } from './list.js';
import { t } from '../../i18n.js';

/** `lism-cli ui` サブコマンドツリーを構築して返す */
export function createUiCommand(): Command {
  const ui = new Command('ui').description(t('cli.ui.description'));

  ui.command('add')
    .description(t('cli.ui.add.description'))
    .argument('[names...]', t('cli.ui.add.arg.names'))
    .option('-o, --overwrite', t('cli.ui.add.opt.overwrite'), false)
    .option('-a, --all', t('cli.ui.add.opt.all'), false)
    .addOption(new Option('--ui-framework <name>', t('cli.init.opt.uiFramework')).choices(['react', 'astro']))
    .option('--ui-dir <path>', t('cli.init.opt.uiDir'))
    .option('--ref <ref>', t('cli.ui.opt.ref'))
    .action(addCommand);

  ui.command('list').description(t('cli.ui.list.description')).option('--ref <ref>', t('cli.ui.opt.ref')).action(listCommand);

  return ui;
}
