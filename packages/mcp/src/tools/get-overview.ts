import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { extractSection } from '../lib/markdown-utils.js';
import { markdownResponse, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

/**
 * SKILL.md を中核に、css-rules.md の Layer 構造セクションと
 * prop-responsive.md のブレークポイントセクションを付加して返す。
 */
function buildOverviewMarkdown(): string {
  const skill = loadMarkdown('SKILL.md');
  const cssRules = loadMarkdown('css-rules.md');
  const responsive = loadMarkdown('prop-responsive.md');

  const layerSection = extractSection(cssRules, 'CSS Layer 構造');
  const bpSection = extractSection(responsive, 'ブレークポイント');

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
        'Get an overview of the lism-css framework: architecture, design philosophy, packages, breakpoints, CSS layers, and implementation rules. Start here to understand the framework before using other tools.',
      annotations: READ_ONLY_ANNOTATIONS,
    },
    () => {
      try {
        return markdownResponse(buildOverviewMarkdown());
      } catch (e) {
        return error(
          `Failed to load overview data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
