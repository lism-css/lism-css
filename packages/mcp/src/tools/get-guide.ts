import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { markdownResponse, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

const GUIDE_TOPICS = {
  overview: { file: 'SKILL.md', label: 'Framework overview, packages, implementation rules' },
  tokens: { file: 'tokens.md', label: 'Design tokens (spacing, colors, font sizes, etc.)' },
  'property-class': { file: 'property-class.md', label: 'Property Class system, all props reference table' },
  'components-core': {
    file: 'components-core.md',
    label: 'Core component system (Lism, Box, Flex, Stack, Grid, etc.)',
  },
  'components-ui': {
    file: 'components-ui.md',
    label: 'UI components (Accordion, Modal, Tabs, Button, etc.)',
  },
  'base-styles': { file: 'base-styles.md', label: 'Base styling, reset CSS, HTML element styles' },
  'set-class': { file: 'set-class.md', label: 'Set classes (set--plain, set--var:bxsh, set--var:hov, etc.)' },
  'primitive-class': { file: 'primitive-class.md', label: 'Primitive class prefixes (is--, l--, a--) and Component class (c--)' },
  'utility-class': { file: 'utility-class.md', label: 'Utility classes (u--trim, u--cbox, etc.)' },
  'css-rules': { file: 'css-rules.md', label: 'CSS methodology, layer structure, naming conventions' },
  responsive: { file: 'prop-responsive.md', label: 'Responsive design, breakpoints, container queries' },
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
        const { file } = GUIDE_TOPICS[topic];
        return markdownResponse(loadMarkdown(file));
      } catch (e) {
        return error(
          `Failed to load guide "${topic}": ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
