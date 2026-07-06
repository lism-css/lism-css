import type { SkillName } from '../../constants.js';

/** スキル配置先を持つ AI ツールのキー */
export type SkillTool = 'claude' | 'codex' | 'cursor' | 'windsurf' | 'cline' | 'copilot' | 'gemini' | 'junie';

/** 各ツール別のスキル配置ベースディレクトリ（cwd 基準の相対パス。配下に skill 名ディレクトリを作る） */
export const SKILL_PATHS: Record<SkillTool, string> = {
  claude: '.claude/skills',
  codex: '.agents/skills',
  cursor: '.cursor/skills',
  windsurf: '.windsurf/skills',
  cline: '.cline/skills',
  copilot: '.github/skills',
  gemini: '.gemini/skills',
  junie: '.junie/skills',
};

/** 指定ツール・スキルの配置先ディレクトリ（cwd 基準の相対パス、例: `.claude/skills/lism-css-guide`） */
export function skillDestDir(tool: SkillTool, skill: SkillName): string {
  return `${SKILL_PATHS[tool]}/${skill}`;
}

export const ALL_SKILL_TOOLS: readonly SkillTool[] = Object.keys(SKILL_PATHS) as SkillTool[];

/** AI ツール自動検出に使う、プロジェクト直下のマーカーディレクトリ／ファイル */
export const TOOL_MARKERS: Record<SkillTool, string[]> = {
  claude: ['.claude'],
  codex: ['.agents', '.codex'],
  cursor: ['.cursor'],
  windsurf: ['.windsurf'],
  cline: ['.cline'],
  copilot: ['.github/copilot-instructions.md', '.github/copilot'],
  gemini: ['.gemini'],
  junie: ['.junie'],
};
