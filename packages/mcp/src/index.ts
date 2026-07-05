import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { preloadAll } from './lib/load-data.js';
import { preloadGuides } from './lib/load-markdown.js';
import { packageVersion } from './lib/version.js';
import { registerGetOverview } from './tools/get-overview.js';
import { registerGetTokens } from './tools/get-tokens.js';
import { registerGetPropsSystem } from './tools/get-props-system.js';
import { registerGetComponent } from './tools/get-component.js';
import { registerGetGuide } from './tools/get-guide.js';
import { registerSearchDocs } from './tools/search-docs.js';
import { registerConvertCss } from './tools/convert-css.js';

async function main() {
  preloadAll();
  preloadGuides();

  const server = new McpServer(
    {
      name: 'lism-css',
      version: packageVersion,
    },
    {
      instructions:
        'Documentation server for the Lism CSS framework (lism-css). Recommended workflow: call get_overview FIRST to load foundational context, then use get_component for a known component, get_props_system for a known prop or CSS property, or get_guide for a broad topic. Use search_docs only as a fallback keyword search when other tools do not cover the need. Use convert_css to migrate existing CSS to Lism props in bulk. All tools are read-only. Guide content is written in Japanese.',
    }
  );

  registerGetOverview(server);
  registerGetTokens(server);
  registerGetPropsSystem(server);
  registerGetComponent(server);
  registerGetGuide(server);
  registerSearchDocs(server);
  registerConvertCss(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
