import fs from 'node:fs';
import path from 'node:path';
import { checkbox, confirm } from '@inquirer/prompts';
import { logger } from '../../logger.js';
import { ALL_SKILL_TOOLS, SKILL_PATHS, TOOL_MARKERS, skillDestDir, type SkillTool } from './paths.js';
import { cleanupTempDir, compareSkillDirs, copyDirRecursive, fetchSkillSource, hasDiff } from './skillSource.js';
import { DEFAULT_SKILL_REF, SKILL_NAMES, type SkillName } from '../../constants.js';
import { t } from '../../i18n.js';

export interface SkillAddOptions {
  all?: boolean;
  overwrite?: boolean;
  ref?: string;
  claude?: boolean;
  codex?: boolean;
  cursor?: boolean;
  windsurf?: boolean;
  cline?: boolean;
  copilot?: boolean;
  gemini?: boolean;
  junie?: boolean;
}

/** CLI オプションから明示指定されたツール一覧を抽出 */
function resolveExplicitTools(options: SkillAddOptions): SkillTool[] {
  if (options.all) return [...ALL_SKILL_TOOLS];
  const explicit = ALL_SKILL_TOOLS.filter((t) => options[t]);
  return explicit;
}

/** プロジェクト内のマーカーから、使用中と思われる AI ツールを自動検出 */
function autoDetectTools(cwd: string): SkillTool[] {
  return ALL_SKILL_TOOLS.filter((tool) => TOOL_MARKERS[tool].some((marker) => fs.existsSync(path.resolve(cwd, marker))));
}

/** positional 引数を配布対象スキルへ解決。未指定なら全スキル、未知の名前なら null（呼び出し側でエラー表示） */
function resolveSkills(skillArg: string | undefined): SkillName[] | null {
  if (skillArg === undefined) return [...SKILL_NAMES];
  return (SKILL_NAMES as readonly string[]).includes(skillArg) ? [skillArg as SkillName] : null;
}

export async function skillAddCommand(skillArg: string | undefined, options: SkillAddOptions): Promise<void> {
  const cwd = process.cwd();

  const skills = resolveSkills(skillArg);
  if (skills === null) {
    logger.error(t('skill.unknownSkill', { name: skillArg!, list: SKILL_NAMES.join(', ') }));
    process.exit(1);
  }

  let targets = resolveExplicitTools(options);

  if (targets.length === 0) {
    const detected = autoDetectTools(cwd);
    if (detected.length > 0) {
      logger.info(t('skill.add.detected', { list: detected.join(', ') }));
    }
    targets = await checkbox<SkillTool>({
      message: t('skill.add.promptTools'),
      choices: ALL_SKILL_TOOLS.map((tool) => ({
        name: `${tool}  →  ${SKILL_PATHS[tool]}`,
        value: tool,
        checked: detected.includes(tool),
      })),
    });
  }

  if (targets.length === 0) {
    logger.warn(t('skill.add.noTargets'));
    return;
  }

  const ref = options.ref ?? DEFAULT_SKILL_REF;

  // スキルごとにリモートを 1 度だけ取得し、選択された全ツールへ配置する
  for (const skill of skills) {
    logger.info(t('skill.add.fetching', { skill, ref }));
    const { dir: srcDir } = await fetchSkillSource(skill, ref);
    try {
      for (const tool of targets) {
        await deploySkillTo(srcDir, skill, tool, options);
      }
    } finally {
      cleanupTempDir(srcDir);
    }
  }
  logger.success(t('common.done'));
}

async function deploySkillTo(srcDir: string, skill: SkillName, tool: SkillTool, options: SkillAddOptions): Promise<void> {
  const relDest = skillDestDir(tool, skill);
  const destDir = path.resolve(process.cwd(), relDest);
  const existing = fs.existsSync(destDir);

  if (existing && !options.overwrite) {
    const diff = compareSkillDirs(destDir, srcDir);
    const label = `${tool} (${relDest})`;

    if (!hasDiff(diff)) {
      logger.log(t('skill.add.skippedSame', { label }));
      return;
    }

    logger.log('');
    logger.log(t('skill.add.hasDiff', { label }));
    if (diff.modified.length > 0) logger.log(t('skill.add.modifiedFiles', { count: diff.modified.length }));
    if (diff.added.length > 0) logger.log(t('skill.add.addedFiles', { count: diff.added.length }));
    if (diff.localOnly.length > 0) {
      logger.log(t('skill.add.localOnlyFiles', { count: diff.localOnly.length }));
      for (const rel of diff.localOnly) logger.log(`      - ${rel}`);
    }

    const go = await confirm({
      message: t('skill.add.confirmOverwrite', { path: relDest }),
      default: false,
    });
    if (!go) {
      logger.log(t('skill.add.skippedTool', { tool }));
      return;
    }
  }

  if (existing) fs.rmSync(destDir, { recursive: true, force: true });
  copyDirRecursive(srcDir, destDir);
  logger.log(t('skill.add.deployed', { tool, path: path.relative(process.cwd(), destDir) }));
}
