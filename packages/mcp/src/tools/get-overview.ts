import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { extractSection } from '../lib/markdown-utils.js';
import { markdownResponse, loadFailureError, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

/**
 * SKILL.md を中核に、css-rules.md の Layer 構造セクションと
 * responsive.md のブレイクポイントセクションを付加して返す。
 */
function buildOverviewMarkdown(): string {
  const skill = loadMarkdown('SKILL.md');
  const cssRules = loadMarkdown('css-rules.md');
  const responsive = loadMarkdown('responsive.md');

  const layerSection = extractSection(cssRules, 'CSS Layer 構造');
  const bpSection = extractSection(responsive, 'ブレイクポイント');

  const parts: string[] = [skill];
  if (layerSection) {
    parts.push('\n---\n');
    parts.push(layerSection);
  }
  if (bpSection) {
    parts.push('\n---\n');
    parts.push(bpSection);
  }

  return parts.join('\n');
}

export function registerGetOverview(server: McpServer): void {
  server.registerTool(
    'get_overview',
    {
      description:
        'Get an overview of the lism-css framework: architecture, design philosophy, packages, breakpoints, CSS layers, and implementation rules.\n' +
        'Use this as your FIRST call when starting any lism-css task — it provides the foundational context needed to use other tools effectively.\n' +
        'Do NOT use this to look up specific components (use get_component), individual props (use get_props_system), or design tokens (use get_tokens).\n' +
        'The response is pre-formatted Markdown. Output it verbatim to the user. Do NOT summarize or omit sections.',
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
