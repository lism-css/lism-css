import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { markdownResponse, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

export function registerGetTokens(server: McpServer): void {
  server.registerTool(
    'get_tokens',
    {
      description:
        'Get design tokens (colors, spacing, font sizes, shadows, etc.) used in lism-css. Returns the full tokens reference as Markdown. Use get_overview first to understand the framework.',
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
