import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { extractPreamble, extractSection } from '../lib/markdown-utils.js';
import { markdownResponse, loadFailureError, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

/**
 * SKILL.md から MCP でも意味を持つ節だけを抜き出す。
 * 実装フロー・判定記号・C0–C8・実行レベル・提出前セルフチェックはスキル（ファイル参照と `.lism/` 保存）前提の作業手順なので含めない。
 */
const SKILL_SECTIONS = ['最小ゲート', '資料確認トリガー', '目的別実装ガイド', 'クラス単位の詳細リファレンス'] as const;

/** 抜き出した節に残るガイドファイル名・判定記号を MCP ツールへ読み替えるための案内。 */
const TOOL_ROUTING = `## Looking up details with this MCP server

Guide file names mentioned below map to tools as follows:

- \`primitives/*.md\`, \`trait-class/*.md\` → \`get_component\` with the class or component name (e.g. "l--stack", "Stack", "a--icon", "is--container", "has--transition")
- \`tokens.md\` → \`get_tokens\`
- \`property-class.md\`, \`property-class/*.md\` → \`get_props_system\` for a single prop, or \`get_guide\` topic "property-class" for the whole system
- \`references/page-sections.md\` → \`get_guide\` topic "page-sections"
- Any other \`*.md\` → \`get_guide\` with the topic of the same name (e.g. \`css-rules.md\` → "css-rules", \`antipatterns.md\` → "antipatterns")
- Keyword search across all docs → \`search_docs\`; bulk CSS-to-Lism conversion → \`convert_css\`

Markers used in the rules below: 🔁 = look up the referenced guide before writing that code; ⏸ = confirm with the user before implementing (hardcoded px values, rounding to a nearby token, changing public classes, etc.). Do not write code while a decision is still 🔁. A hardcoded value is allowed as a documented exception (✅例外) only when the "直書きしてよい例外" section of \`antipatterns.md\` (\`get_guide\` topic "antipatterns") lists that case; user instructions such as "reproduce it exactly" do not count.`;

function buildOverviewMarkdown(): string {
  const skill = loadMarkdown('SKILL.md');
  const cssRules = loadMarkdown('css-rules.md');
  const responsive = loadMarkdown('responsive.md');

  // 冒頭（タイトル・公式ドキュメント URL・対象バージョン）。
  // スキルの作業手順（実行レベル判定→セルフチェック）の一文は落とし、スキル更新の案内は MCP 向けに読み替える。
  const preamble = extractPreamble(skill)
    .replace(/変更規模から実行レベルを判定し、[^。]*。/, '')
    .replace('このスキルの更新', '`@lism-css/mcp`の更新');

  const parts: string[] = [preamble, TOOL_ROUTING];
  for (const heading of SKILL_SECTIONS) {
    const section = extractSection(skill, heading);
    if (section) parts.push(section);
  }

  const layerSection = extractSection(cssRules, 'CSS Layer 構造');
  if (layerSection) parts.push(layerSection);
  const bpSection = extractSection(responsive, 'ブレイクポイント');
  if (bpSection) parts.push(bpSection);

  return parts.join('\n\n---\n\n');
}

export function registerGetOverview(server: McpServer): void {
  server.registerTool(
    'get_overview',
    {
      description:
        'Get an overview of the lism-css framework: core rules (minimum gates), which reference to look up before writing what, primitive/component selection by goal, class inventory, CSS layers, and breakpoints.\n' +
        'Use this as your FIRST call when starting any lism-css task — it provides the foundational context needed to use other tools effectively.\n' +
        'Do NOT use this to look up specific components (use get_component), individual props (use get_props_system), or design tokens (use get_tokens).\n' +
        'The response is Markdown reference material. Use it as context for your answer or implementation; do not paraphrase rules or invent class names, props, or token values that are not in it.',
      annotations: READ_ONLY_ANNOTATIONS,
    },
    () => {
      try {
        return markdownResponse(buildOverviewMarkdown());
      } catch (e) {
        return loadFailureError('overview data', e);
      }
    }
  );
}
