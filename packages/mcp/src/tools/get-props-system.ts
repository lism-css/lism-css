import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { PropsSystemDataSchema } from '../lib/schemas.js';
import { parsePropClassName } from '../lib/search.js';
import { success, error, notFound, READ_ONLY_ANNOTATIONS } from '../lib/response.js';
import type { PropCategory } from '../lib/types.js';

/** cssProperty フィールドからコア名を抽出（例: "--hl (CSS変数)" → "--hl"） */
function normalizeCssProperty(raw: string): string {
  // "(class: is--container)" → "is--container"
  const classMatch = raw.match(/\(class:\s*(.+?)\)/);
  if (classMatch) return classMatch[1].trim().toLowerCase();

  // "--hl (CSS変数)" → "--hl"
  return raw
    .replace(/\s*\(.*\)$/, '')
    .trim()
    .toLowerCase();
}

export function registerGetPropsSystem(server: McpServer): void {
  server.registerTool(
    'get_props_system',
    {
      description:
        'Get the lism-css Props system reference: how React/Astro props map to CSS classes and styles. Supports lookup by lism prop name (e.g. "p", "fz") OR by CSS property name (e.g. "padding", "font-size"). Use this for CSS-to-lism reverse lookup. Related: use convert_css for bulk CSS conversion, get_component to see how props are used in components.',
      inputSchema: {
        prop: z
          .string()
          .optional()
          .describe(
            'Prop name or CSS property name to look up. Accepts lism prop names (e.g. "p", "fz", "bgc") and standard CSS property names (e.g. "padding", "font-size", "background-color"). Omit to get the full system overview.'
          ),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ prop }) => {
      try {
        const data = loadJSON('props-system.json', PropsSystemDataSchema);

        if (!prop) {
          return success(data as unknown as Record<string, unknown>);
        }

        const queryLower = parsePropClassName(prop) ?? prop.toLowerCase();
        const matched: PropCategory[] = [];

        for (const cat of data.categories) {
          const found = cat.props.filter((p) => {
            // Lism prop 名で一致
            if (p.prop.toLowerCase() === queryLower) return true;

            // CSS プロパティ名で一致（逆引き）
            const normalizedCss = normalizeCssProperty(p.cssProperty);
            if (normalizedCss === queryLower) return true;

            return false;
          });

          if (found.length > 0) {
            matched.push({ ...cat, props: found });
          }
        }

        if (matched.length === 0) {
          const allProps = data.categories.flatMap((c) => c.props.map((p) => `${p.prop} (${p.cssProperty})`));
          return notFound(
            `"${prop}" に一致する Prop が見つかりません。Lism prop 名 (例: "p", "fz") または CSS プロパティ名 (例: "padding", "font-size") で検索できます。`,
            { availableProps: allProps }
          );
        }

        return success({ description: data.description, categories: matched });
      } catch (e) {
        return error(
          `Failed to load props system data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Ensure the server was installed correctly.`
        );
      }
    }
  );
}
