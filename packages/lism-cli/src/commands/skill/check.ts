import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../logger.js';
import { ALL_SKILL_TOOLS, SKILL_PATHS } from './paths.js';
import { readSkillVersion, resolveSkillSourceDir } from './skillSource.js';

export function skillCheckCommand(): void {
  const srcDir = resolveSkillSourceDir();
  const bundledVersion = readSkillVersion(srcDir);
  logger.log(`同梱スキルのバージョン: ${bundledVersion ?? '(unknown)'}`);

  const cwd = process.cwd();
  let anyInstalled = false;

  for (const tool of ALL_SKILL_TOOLS) {
    const localDir = path.resolve(cwd, SKILL_PATHS[tool]);
    if (!fs.existsSync(path.join(localDir, 'SKILL.md'))) continue;
    anyInstalled = true;
    const localVersion = readSkillVersion(localDir);
    const label = `${tool.padEnd(9)} ${SKILL_PATHS[tool]}`;
    if (!bundledVersion || !localVersion) {
      logger.log(`  ? ${label}  (version: ${localVersion ?? 'unknown'})`);
    } else if (localVersion === bundledVersion) {
      logger.log(`  ✓ ${label}  (up to date: ${localVersion})`);
    } else {
      logger.warn(`  ! ${label}  (local: ${localVersion} → bundled: ${bundledVersion})`);
    }
  }

  if (!anyInstalled) {
    logger.info('インストール済みのスキルは見つかりませんでした。`lism skill add` で配置できます。');
  }
}
