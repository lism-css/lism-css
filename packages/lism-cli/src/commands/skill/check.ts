import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../logger.js';
import { ALL_SKILL_TOOLS, skillDestDir, type SkillTool } from './paths.js';
import { cleanupTempDir, compareSkillDirs, fetchSkillSource, hasDiff, type SkillDiff } from './skillSource.js';
import { DEFAULT_SKILL_REF, SKILL_NAMES, type SkillName } from '../../constants.js';
import { t } from '../../i18n.js';
import { getInvokeCommand } from '../../invokeCommand.js';

export interface SkillCheckOptions {
  ref?: string;
  verbose?: boolean;
}

export async function skillCheckCommand(options: SkillCheckOptions = {}): Promise<void> {
  const cwd = process.cwd();

  // 全レジストリスキル × 全ツールの組から、配置済み（SKILL.md が存在）のものを集める
  const installed: { skill: SkillName; tool: SkillTool }[] = [];
  for (const skill of SKILL_NAMES) {
    for (const tool of ALL_SKILL_TOOLS) {
      if (fs.existsSync(path.join(cwd, skillDestDir(tool, skill), 'SKILL.md'))) {
        installed.push({ skill, tool });
      }
    }
  }

  if (installed.length === 0) {
    logger.info(t('skill.check.noneInstalled', { invoke: getInvokeCommand() }));
    return;
  }

  const ref = options.ref ?? DEFAULT_SKILL_REF;
  let outdatedCount = 0;

  // スキルごとにリモートを 1 度だけ取得し、そのスキルの全配置先と比較する
  for (const skill of SKILL_NAMES) {
    const pairs = installed.filter((p) => p.skill === skill);
    if (pairs.length === 0) continue;

    logger.info(t('skill.check.fetching', { skill, ref }));
    const { dir: remoteDir } = await fetchSkillSource(skill, ref);
    try {
      for (const { tool } of pairs) {
        const relDest = skillDestDir(tool, skill);
        const localDir = path.resolve(cwd, relDest);
        const diff = compareSkillDirs(localDir, remoteDir);
        const label = `${tool.padEnd(9)} ${relDest}`;

        if (!hasDiff(diff)) {
          logger.log(t('skill.check.upToDate', { label }));
          continue;
        }

        outdatedCount += 1;
        logger.warn(`  ! ${label}`);
        logger.log(formatDiffSummary(diff));
        if (options.verbose) logger.log(formatDiffDetails(diff));
      }
    } finally {
      cleanupTempDir(remoteDir);
    }
  }

  logger.log('');
  if (outdatedCount === 0) {
    logger.success(t('skill.check.allLatest'));
  } else {
    logger.info(t('skill.check.outdated', { count: outdatedCount, invoke: getInvokeCommand() }));
  }
}

function formatDiffSummary(diff: SkillDiff): string {
  const parts: string[] = [];
  if (diff.modified.length > 0) parts.push(t('skill.check.diffModified', { count: diff.modified.length }));
  if (diff.added.length > 0) parts.push(t('skill.check.diffAdded', { count: diff.added.length }));
  if (diff.localOnly.length > 0) parts.push(t('skill.check.diffDeleted', { count: diff.localOnly.length }));
  return `      ${parts.join(' / ')}`;
}

function formatDiffDetails(diff: SkillDiff): string {
  const lines: string[] = [];
  for (const rel of diff.modified) lines.push(`      ~ ${rel}`);
  for (const rel of diff.added) lines.push(`      + ${rel}`);
  for (const rel of diff.localOnly) lines.push(`      - ${rel}`);
  return lines.join('\n');
}
