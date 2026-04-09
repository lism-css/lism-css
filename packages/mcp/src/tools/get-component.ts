import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { findComponentByHeading, findComponentInTables } from '../lib/markdown-utils.js';
import { markdownResponse, error, notFound, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

export function registerGetComponent(server: McpServer): void {
  server.registerTool(
    'get_component',
    {
      description:
        'Get detailed information about a specific lism-css component: purpose, props, and usage examples.\n' +
        'Use this when you need documentation for a known component by name (e.g. "Box", "Flex", "Accordion", "Lism", "HTML").\n' +
        'Do NOT use this for broad topic guides (use get_guide with "components-core" or "components-ui") or keyword search across all docs (use search_docs).\n' +
        'If the component is not found, suggestions will be provided — follow up with search_docs for a broader query.\n' +
        'The response is pre-formatted Markdown. Output it verbatim. Do NOT summarize or omit code examples.',
      inputSchema: {
        name: z.string().describe('Component name to look up (e.g. "Box", "Flex", "Accordion").'),
        package: z
          .enum(['lism-css', '@lism-css/ui'])
          .optional()
          .describe('Filter by package. "lism-css" for core components, "@lism-css/ui" for UI components.'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ name, package: pkg }) => {
      try {
        const nameLower = name.toLowerCase();

        // --- @lism-css/ui コンポーネントを検索 ---
        if (!pkg || pkg === '@lism-css/ui') {
          const uiMd = loadMarkdown('components-ui.md');

          // ## ComponentName 形式の見出しで検索（完全一致）
          const uiSection = findComponentByHeading(uiMd, name);
          if (uiSection) {
            return markdownResponse(uiSection);
          }

          // 大文字小文字を無視した見出し検索
          const uiLines = uiMd.split('\n');
          const headingLine = uiLines.find((l) => l.startsWith('## ') && l.slice(3).trim().toLowerCase() === nameLower);
          if (headingLine) {
            const section = findComponentByHeading(uiMd, headingLine.slice(3).trim());
            if (section) return markdownResponse(section);
          }
        }

        // --- lism-css コアコンポーネントを検索 ---
        if (!pkg || pkg === 'lism-css') {
          const coreMd = loadMarkdown('components-core.md');

          // 見出しにコンポーネント名を含むセクションを検索（Lism, HTML 等）
          const coreLines = coreMd.split('\n');
          const headingLine = coreLines.find((l) => /^#{2,3}\s/.test(l) && l.toLowerCase().includes(`<${nameLower}>`));
          if (headingLine) {
            const headingText = headingLine.replace(/^#+\s*/, '').trim();
            const section = findComponentByHeading(coreMd, headingText);
            if (section) return markdownResponse(section);
          }

          // テーブル内の `<ComponentName>` で検索
          const coreSection = findComponentInTables(coreMd, name);
          if (coreSection) {
            return markdownResponse(coreSection);
          }
        }

        // --- 部分一致で候補を提示 ---
        const uiMd = loadMarkdown('components-ui.md');
        const coreMd = loadMarkdown('components-core.md');

        const uiCandidates = uiMd
          .split('\n')
          .filter((l) => l.startsWith('## ') && l.toLowerCase().includes(nameLower))
          .map((l) => l.slice(3).trim());

        const coreCandidates: string[] = [];
        for (const line of coreMd.split('\n')) {
          if (line.startsWith('|') && line.toLowerCase().includes(nameLower)) {
            const match = line.match(/`<([^>]+)>`/);
            if (match) coreCandidates.push(match[1]);
          }
        }

        const suggestions = [...new Set([...uiCandidates, ...coreCandidates])];
        if (suggestions.length > 0) {
          return notFound(`Component "${name}" not found. Did you mean one of these? Or try search_docs with a broader query.`, {
            suggestions,
          });
        }

        return notFound(`Component "${name}" not found. Try search_docs or get_guide to find related pages.`, {
          tip: 'Use get_guide with topic="components-core" or "components-ui" to see all available components.',
        });
      } catch (e) {
        return error(
          `Failed to load component data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
