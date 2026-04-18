import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../logger.js';
import { ALL_SKILL_TOOLS, SKILL_PATHS } from './paths.js';
import { cleanupTempDir, compareSkillDirs, fetchSkillSource, hasDiff, type SkillDiff } from './skillSource.js';
import { DEFAULT_SKILL_REF } from '../../constants.js';

export interface SkillCheckOptions {
  ref?: string;
  verbose?: boolean;
}

export async function skillCheckCommand(options: SkillCheckOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const installed = ALL_SKILL_TOOLS.filter((tool) => fs.existsSync(path.join(cwd, SKILL_PATHS[tool], 'SKILL.md')));

  if (installed.length === 0) {
    logger.info('インストール済みのスキルは見つかりませんでした。`lism skill add` で配置できます。');
    return;
  }

  const ref = options.ref ?? DEFAULT_SKILL_REF;
  logger.info(`リモートスキルを取得中（ref: ${ref}）...`);
  const { dir: remoteDir } = await fetchSkillSource(ref);

  try {
    let outdatedCount = 0;
    for (const tool of installed) {
      const localDir = path.resolve(cwd, SKILL_PATHS[tool]);
      const diff = compareSkillDirs(localDir, remoteDir);
      const label = `${tool.padEnd(9)} ${SKILL_PATHS[tool]}`;

      if (!hasDiff(diff)) {
        logger.log(`  ✓ ${label}  (最新)`);
        continue;
      }

      outdatedCount += 1;
      logger.warn(`  ! ${label}`);
      logger.log(formatDiffSummary(diff));
      if (options.verbose) logger.log(formatDiffDetails(diff));
    }

    logger.log('');
    if (outdatedCount === 0) {
      logger.success('すべてのスキルが最新です。');
    } else {
      logger.info(`${outdatedCount} 件のツールに差分があります。\`lism skill update\` で最新に更新できます。`);
    }
  } finally {
    cleanupTempDir(remoteDir);
  }
}

function formatDiffSummary(diff: SkillDiff): string {
  const parts: string[] = [];
  if (diff.modified.length > 0) parts.push(`変更 ${diff.modified.length}`);
  if (diff.added.length > 0) parts.push(`追加 ${diff.added.length}`);
  if (diff.localOnly.length > 0) parts.push(`削除 ${diff.localOnly.length}`);
  return `      ${parts.join(' / ')}`;
}

function formatDiffDetails(diff: SkillDiff): string {
  const lines: string[] = [];
  for (const rel of diff.modified) lines.push(`      ~ ${rel}`);
  for (const rel of diff.added) lines.push(`      + ${rel}`);
  for (const rel of diff.localOnly) lines.push(`      - ${rel}`);
  return lines.join('\n');
}
