import { Command } from 'commander';
import { skillAddCommand } from './add.js';
import { skillCheckCommand } from './check.js';
import { skillUpdateCommand } from './update.js';

/** `lism skill` サブコマンドツリー */
export function createSkillCommand(): Command {
  const skill = new Command('skill').description('AI エージェント向けスキル（SKILL.md）の配置と管理');

  const toolFlags = (cmd: Command) =>
    cmd
      .option('--all', '全ツールに配置')
      .option('--claude', '.claude/skills/ に配置')
      .option('--codex', '.agents/skills/ に配置')
      .option('--cursor', '.cursor/skills/ に配置')
      .option('--windsurf', '.windsurf/skills/ に配置')
      .option('--cline', '.cline/skills/ に配置')
      .option('--copilot', '.github/skills/ に配置')
      .option('--gemini', '.gemini/skills/ に配置')
      .option('--junie', '.junie/skills/ に配置');

  toolFlags(
    skill
      .command('add')
      .description('スキルを配置する')
      .option('-o, --overwrite', '確認なしで上書き', false)
      .option('-y, --yes', '確認プロンプトをスキップ（差分なしなら noop、差分ありなら上書き）', false)
      .option('--ref <ref>', 'GitHub の取得元 ref（ブランチ／タグ／コミット）')
  ).action(skillAddCommand);

  skill
    .command('check')
    .description('配置済みスキルとリモートの差分を確認する')
    .option('--ref <ref>', 'GitHub の取得元 ref（ブランチ／タグ／コミット）')
    .option('-v, --verbose', 'ファイル単位の差分を表示')
    .action(skillCheckCommand);

  toolFlags(
    skill
      .command('update')
      .description('配置済みスキルを最新版で上書きする（--overwrite 同等）')
      .option('--ref <ref>', 'GitHub の取得元 ref（ブランチ／タグ／コミット）')
  ).action(skillUpdateCommand);

  return skill;
}
