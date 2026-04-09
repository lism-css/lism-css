import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { markdownResponse, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

export function registerGetTokens(server: McpServer): void {
  server.registerTool(
    'get_tokens',
    {
      description:
        'Get design tokens (colors, spacing, font sizes, shadows, etc.) used in lism-css. Returns the full token reference including CSS variable names and available values.\n' +
        'Use this when you need to check available token values, variable names, or design scales (e.g. "what spacing values exist?", "what are the font size tokens?").\n' +
        'For prop-to-CSS mappings, get_props_system is more suitable. For CSS conversion, use convert_css. Call get_overview first if you have not yet.\n' +
        'The response is pre-formatted Markdown. Output it verbatim. Do NOT summarize or omit token values.',
      annotations: READ_ONLY_ANNOTATIONS,
    },
    () => {
      try {
        return markdownResponse(loadMarkdown('tokens.md'));
      } catch (e) {
        return error(
          `Failed to load tokens data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
