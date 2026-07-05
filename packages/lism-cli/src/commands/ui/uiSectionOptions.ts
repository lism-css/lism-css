import { Command, Option } from 'commander';
import { t } from '../../i18n.js';

/**
 * `ui:` セクション値の先渡しオプション（--ui-framework / --ui-dir）をコマンドに追加する。
 * `init` と `ui add` の両方で受け付けるため、framework の選択肢が食い違わないよう一箇所で定義する。
 */
export function applyUiSectionOptions(command: Command): Command {
  return command
    .addOption(new Option('--ui-framework <name>', t('cli.init.opt.uiFramework')).choices(['react', 'astro']))
    .option('--ui-dir <path>', t('cli.init.opt.uiDir'));
}
