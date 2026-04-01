import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program.name('lism-ui').description('Lism UI コンポーネントをプロジェクトに追加する CLI ツール').version('0.1.0');

program.command('init').description('lism-ui.json を生成する').action(initCommand);

program
  .command('add')
  .description('コンポーネントを追加する')
  .argument('[names...]', '追加するコンポーネント名')
  .option('-o, --overwrite', '既存ファイルを確認なしで上書き', false)
  .option('-a, --all', '全コンポーネントを追加', false)
  .action(addCommand);

program.command('list').description('利用可能なコンポーネント一覧を表示する').action(listCommand);

program.parse();
