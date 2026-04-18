import { Command } from 'commander';
import { skillAddCommand } from './add.js';
import { skillCheckCommand } from './check.js';
import { skillUpdateCommand } from './update.js';
import { SKILL_PATHS } from './paths.js';
import { t } from '../../i18n.js';

/** `lism skill` サブコマンドツリー */
export function createSkillCommand(): Command {
  const skill = new Command('skill').description(t('cli.skill.description'));

  const toolOptDescription = (tool: keyof typeof SKILL_PATHS): string => t('cli.skill.opt.toolPath', { path: SKILL_PATHS[tool] });

  const toolFlags = (cmd: Command) =>
    cmd
      .option('--all', t('cli.skill.opt.all'))
      .option('--claude', toolOptDescription('claude'))
      .option('--codex', toolOptDescription('codex'))
      .option('--cursor', toolOptDescription('cursor'))
      .option('--windsurf', toolOptDescription('windsurf'))
      .option('--cline', toolOptDescription('cline'))
      .option('--copilot', toolOptDescription('copilot'))
      .option('--gemini', toolOptDescription('gemini'))
      .option('--junie', toolOptDescription('junie'));

  toolFlags(
    skill
      .command('add')
      .description(t('cli.skill.add.description'))
      .option('-o, --overwrite', t('cli.skill.add.opt.overwrite'), false)
      .option('--ref <ref>', t('cli.skill.opt.ref'))
  ).action(skillAddCommand);

  skill
    .command('check')
    .description(t('cli.skill.check.description'))
    .option('--ref <ref>', t('cli.skill.opt.ref'))
    .option('-v, --verbose', t('cli.skill.check.opt.verbose'))
    .action(skillCheckCommand);

  toolFlags(skill.command('update').description(t('cli.skill.update.description')).option('--ref <ref>', t('cli.skill.opt.ref'))).action(
    skillUpdateCommand
  );

  return skill;
}
