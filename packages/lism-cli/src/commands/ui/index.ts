import { Command } from 'commander';
import { addCommand } from './add.js';
import { initCommand } from './init.js';
import { listCommand } from './list.js';

/** `lism ui` サブコマンドツリーを構築して返す */
export function createUiCommand(): Command {
  const ui = new Command('ui').description('Lism UI コンポーネントの追加・管理');

  ui.command('init').description('lism.config.js の cli セクションを生成する').action(initCommand);

  ui.command('add')
    .description('コンポーネントを追加する')
    .argument('[names...]', '追加するコンポーネント名')
    .option('-o, --overwrite', '既存ファイルを確認なしで上書き', false)
    .option('-a, --all', '全コンポーネントを追加', false)
    .action(addCommand);

  ui.command('list').description('利用可能なコンポーネント一覧を表示する').action(listCommand);

  return ui;
}
