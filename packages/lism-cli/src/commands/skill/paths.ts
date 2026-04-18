/** スキル配置先を持つ AI ツールのキー */
export type SkillTool = 'claude' | 'codex' | 'cursor' | 'windsurf' | 'cline' | 'copilot' | 'gemini' | 'junie';

/** 各ツール別のスキル配置先（cwd 基準の相対パス） */
export const SKILL_PATHS: Record<SkillTool, string> = {
  claude: '.claude/skills/lism-css-guide',
  codex: '.agents/skills/lism-css-guide',
  cursor: '.cursor/skills/lism-css-guide',
  windsurf: '.windsurf/skills/lism-css-guide',
  cline: '.cline/skills/lism-css-guide',
  copilot: '.github/skills/lism-css-guide',
  gemini: '.gemini/skills/lism-css-guide',
  junie: '.junie/skills/lism-css-guide',
};

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
