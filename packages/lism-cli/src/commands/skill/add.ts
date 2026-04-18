import fs from 'node:fs';
import path from 'node:path';
import { checkbox, confirm } from '@inquirer/prompts';
import { logger } from '../../logger.js';
import { ALL_SKILL_TOOLS, SKILL_PATHS, TOOL_MARKERS, type SkillTool } from './paths.js';
import { cleanupTempDir, compareSkillDirs, copyDirRecursive, fetchSkillSource, hasDiff } from './skillSource.js';
import { DEFAULT_SKILL_REF } from '../../constants.js';
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

export async function skillAddCommand(options: SkillAddOptions): Promise<void> {
  const cwd = process.cwd();

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
  logger.info(t('skill.add.fetching', { ref }));
  const { dir: srcDir } = await fetchSkillSource(ref);

  try {
    for (const tool of targets) {
      await deploySkillTo(srcDir, tool, options);
    }
    logger.success(t('common.done'));
  } finally {
    cleanupTempDir(srcDir);
  }
}

async function deploySkillTo(srcDir: string, tool: SkillTool, options: SkillAddOptions): Promise<void> {
  const destDir = path.resolve(process.cwd(), SKILL_PATHS[tool]);
  const existing = fs.existsSync(destDir);

  if (existing && !options.overwrite) {
    const diff = compareSkillDirs(destDir, srcDir);
    const label = `${tool} (${SKILL_PATHS[tool]})`;

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
      message: t('skill.add.confirmOverwrite', { path: SKILL_PATHS[tool] }),
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
