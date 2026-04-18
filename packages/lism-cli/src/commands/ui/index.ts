import { Command, Option } from 'commander';
import { addCommand } from './add.js';
import { initCommand } from './init.js';
import { listCommand } from './list.js';

/** `lism ui` サブコマンドツリーを構築して返す */
export function createUiCommand(): Command {
  const ui = new Command('ui').description('Lism UI コンポーネントの追加・管理');

  ui.command('init')
    .description('lism.config.js の cli セクションを生成する')
    .addOption(new Option('--framework <name>', 'フレームワーク').choices(['react', 'astro']))
    .option('--components-dir <path>', 'コンポーネントの出力先ディレクトリ')
    .option('--helper-dir <path>', 'helper の出力先ディレクトリ')
    .option('-f, --force', '既存の cli セクションを上書き', false)
    .action(initCommand);

  ui.command('add')
    .description('コンポーネントを追加する')
    .argument('[names...]', '追加するコンポーネント名')
    .option('-o, --overwrite', '既存ファイルを確認なしで上書き', false)
    .option('-a, --all', '全コンポーネントを追加', false)
    .option('--ref <ref>', '取得元の Git ref（ブランチ / タグ / コミット）')
    .action(addCommand);

  ui.command('list')
    .description('利用可能なコンポーネント一覧を表示する')
    .option('--ref <ref>', '取得元の Git ref（ブランチ / タグ / コミット）')
    .action(listCommand);

  return ui;
}
