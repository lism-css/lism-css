import { Command, Option } from 'commander';
import { addCommand } from './add.js';
import { initCommand } from './init.js';
import { listCommand } from './list.js';
import { t } from '../../i18n.js';

/** `lism ui` サブコマンドツリーを構築して返す */
export function createUiCommand(): Command {
  const ui = new Command('ui').description(t('cli.ui.description'));

  ui.command('init')
    .description(t('cli.ui.init.description'))
    .addOption(new Option('--framework <name>', t('cli.ui.init.opt.framework')).choices(['react', 'astro']))
    .option('--components-dir <path>', t('cli.ui.init.opt.componentsDir'))
    .option('--helper-dir <path>', t('cli.ui.init.opt.helperDir'))
    .option('-f, --force', t('cli.ui.init.opt.force'), false)
    .action(initCommand);

  ui.command('add')
    .description(t('cli.ui.add.description'))
    .argument('[names...]', t('cli.ui.add.arg.names'))
    .option('-o, --overwrite', t('cli.ui.add.opt.overwrite'), false)
    .option('-a, --all', t('cli.ui.add.opt.all'), false)
    .option('--ref <ref>', t('cli.ui.opt.ref'))
    .action(addCommand);

  ui.command('list').description(t('cli.ui.list.description')).option('--ref <ref>', t('cli.ui.opt.ref')).action(listCommand);

  return ui;
}
