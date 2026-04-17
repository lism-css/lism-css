import fs from 'node:fs';
import path from 'node:path';
import { checkbox, confirm } from '@inquirer/prompts';
import { logger } from '../../logger.js';
import { ALL_SKILL_TOOLS, SKILL_PATHS, TOOL_MARKERS, type SkillTool } from './paths.js';
import { copyDirRecursive, resolveSkillSourceDir } from './skillSource.js';

export interface SkillAddOptions {
  all?: boolean;
  overwrite?: boolean;
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
  const srcDir = resolveSkillSourceDir();

  let targets = resolveExplicitTools(options);

  if (targets.length === 0) {
    const detected = autoDetectTools(cwd);
    if (detected.length > 0) {
      logger.info(`検出した AI ツール: ${detected.join(', ')}`);
    }
    targets = await checkbox<SkillTool>({
      message: '配置先のツールを選択してください（スペースで選択、Enter で確定）:',
      choices: ALL_SKILL_TOOLS.map((t) => ({
        name: `${t}  →  ${SKILL_PATHS[t]}`,
        value: t,
        checked: detected.includes(t),
      })),
    });
  }

  if (targets.length === 0) {
    logger.warn('配置先が選択されませんでした。');
    return;
  }

  for (const tool of targets) {
    await deploySkillTo(srcDir, tool, options.overwrite ?? false);
  }

  logger.success('完了しました。');
}

async function deploySkillTo(srcDir: string, tool: SkillTool, overwrite: boolean): Promise<void> {
  const destDir = path.resolve(process.cwd(), SKILL_PATHS[tool]);
  const existing = fs.existsSync(destDir);

  if (existing && !overwrite) {
    const go = await confirm({
      message: `${SKILL_PATHS[tool]} は既に存在します。上書きしますか？`,
      default: false,
    });
    if (!go) {
      logger.log(`  スキップ: ${tool}`);
      return;
    }
  }

  if (existing) fs.rmSync(destDir, { recursive: true, force: true });
  copyDirRecursive(srcDir, destDir);
  logger.log(`  配置: ${tool} → ${path.relative(process.cwd(), destDir)}`);
}
