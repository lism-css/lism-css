import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { markdownResponse, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

// files に複数指定したトピックは結合して返す。
// MCP クライアントは Markdown 内の相対リンクを辿れないため、分冊ファイルは本体に結合する。
const GUIDE_TOPICS = {
  overview: { files: ['SKILL.md'], label: 'Framework overview, packages, implementation rules' },
  tokens: { files: ['tokens.md'], label: 'Design tokens (spacing, colors, font sizes, etc.)' },
  'property-class': {
    files: ['property-class.md', 'property-class/all-props.md', 'property-class/bd.md', 'property-class/hov.md', 'property-class/max-sz.md'],
    label: 'Property Class system, all props reference table, border (bd) / hover (hov) / max-sz details',
  },
  'components-core': {
    files: ['components-core.md'],
    label: 'Core component system (Lism, Box, Flex, Stack, Grid, etc.)',
  },
  'components-ui': {
    files: ['components-ui.md'],
    label: 'UI components (Accordion, Modal, Tabs, Button, etc.)',
  },
  'base-styles': { files: ['base-styles.md'], label: 'Base styling, reset CSS, HTML element styles' },
  'set-class': { files: ['set-class.md'], label: 'Set classes (set--plain, set--bxsh, set--hov, etc.)' },
  'primitive-class': {
    files: ['primitive-class.md'],
    label: 'Primitive class prefixes (is--, l--, a--) and Component class (c--), with column-layout primitive selection guide',
  },
  'utility-class': { files: ['utility-class.md'], label: 'Utility classes (u--trim, u--cbox, etc.)' },
  'css-rules': { files: ['css-rules.md'], label: 'CSS methodology, layer structure, naming conventions' },
  responsive: { files: ['responsive.md'], label: 'Responsive design, breakpoints, container queries' },
  antipatterns: {
    files: ['antipatterns.md'],
    label: 'AI code-generation antipatterns (values / style declarations): px hardcoding, token typos, keycolor misuse, prop type mistakes',
  },
  'antipatterns-layout': {
    files: ['antipatterns-layout.md'],
    label:
      'AI code-generation antipatterns (structure / layout / responsive): layout choice errors, responsive omissions, is-- misuse, naming mistakes',
  },
} as const;

type GuideTopic = keyof typeof GUIDE_TOPICS;

const TOPIC_DESCRIPTION = Object.entries(GUIDE_TOPICS)
  .map(([key, { label }]) => `- ${key}: ${label}`)
  .join('\n');

export function registerGetGuide(server: McpServer): void {
  server.registerTool(
    'get_guide',
    {
      description:
        'Get a detailed guide on a specific lism-css topic. Use this when you need comprehensive documentation on a broad topic rather than a specific component or prop.\n' +
        'For individual component lookup, get_component is more direct. For individual prop lookup, use get_props_system.\n' +
        'The response is the full guide as pre-formatted Markdown. Output it verbatim. Do NOT summarize or omit sections.\n' +
        `\nAvailable topics:\n${TOPIC_DESCRIPTION}`,
      inputSchema: {
        topic: z.enum(Object.keys(GUIDE_TOPICS) as [GuideTopic, ...GuideTopic[]]).describe('The guide topic to retrieve.'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ topic }) => {
      try {
        const { files } = GUIDE_TOPICS[topic];
        return markdownResponse(files.map((file) => loadMarkdown(file)).join('\n\n'));
      } catch (e) {
        return error(
          `Failed to load guide "${topic}": ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
