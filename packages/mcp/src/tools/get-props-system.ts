import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMarkdown } from '../lib/load-markdown.js';
import { parsePropRows } from '../lib/markdown-utils.js';
import { parsePropClassName } from '../lib/search.js';
import { markdownResponse, error, notFound, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

/** cssProperty フィールドからコア名を抽出（"--hl 変数のみ" → "--hl"） */
function normalizeCssProperty(raw: string): string {
  return raw
    .replace(/\s*\(.*\)$/, '')
    .replace(/（[^）]*）$/, '')
    .trim()
    .toLowerCase();
}

export function registerGetPropsSystem(server: McpServer): void {
  server.registerTool(
    'get_props_system',
    {
      description:
        'Get the lism-css Props system reference: how React/Astro props map to CSS classes and styles. Supports lookup by lism prop name (e.g. "p", "fz") OR by CSS property name (e.g. "padding", "font-size"). Omit the prop parameter to get the full reference.\n' +
        'Use this when you need to find a specific prop mapping, understand the Property Class system, or check what CSS property a lism prop corresponds to.\n' +
        'For bulk CSS-to-lism conversion, convert_css is more efficient. For component-specific documentation, use get_component.\n' +
        'The response is pre-formatted Markdown. Output it verbatim. Do NOT summarize the prop tables.',
      inputSchema: {
        prop: z
          .string()
          .optional()
          .describe(
            'Prop name or CSS property name to look up. Accepts lism prop names (e.g. "p", "fz", "bgc") and standard CSS property names (e.g. "padding", "font-size", "background-color"). Omit to get the full reference.'
          ),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ prop }) => {
      try {
        const md = loadMarkdown('property-class.md');

        // prop 未指定: 全文を返す
        if (!prop) {
          return markdownResponse(md);
        }

        const queryLower = parsePropClassName(prop) ?? prop.toLowerCase();
        const rows = parsePropRows(md);

        // 一致する行を探す
        const matched = rows.filter((row) => {
          if (row.prop.toLowerCase() === queryLower) return true;
          const normalizedCss = normalizeCssProperty(row.cssProperty);
          if (normalizedCss === queryLower) return true;
          return false;
        });

        if (matched.length === 0) {
          const availableProps = rows.map((r) => `${r.prop} (${r.cssProperty})`);
          return notFound(
            `"${prop}" に一致する Prop が見つかりません。Lism prop 名 (例: "p", "fz") または CSS プロパティ名 (例: "padding", "font-size") で検索できます。`,
            { availableProps }
          );
        }

        // 一致したセクション名のユニーク一覧を取得
        const sections = [...new Set(matched.map((r) => r.sectionName))];

        // property-class.md から対象セクションを抽出して結合
        const lines = md.split('\n');
        const resultParts: string[] = [`## 検索結果: "${prop}"\n`];

        for (const sectionName of sections) {
          // セクション内の一致する行だけを含む簡易 Markdown を生成
          const sectionRows = matched.filter((r) => r.sectionName === sectionName);
          const header = `### ${sectionName}\n`;
          const tableHeader = '| Prop | CSS プロパティ | プリセット値クラス | BP クラス |\n|------|--------------|-------------|-----|';

          // 対応する元テーブル行を探して取得
          const tableRows = sectionRows.map((row) => {
            const pattern = new RegExp(`^\\|\\s*\`${row.prop.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\`\\s*\\|`);
            const originalLine = lines.find((l) => pattern.test(l));
            return originalLine ?? `| \`${row.prop}\` | \`${row.cssProperty}\` | — | — |`;
          });

          resultParts.push(header + tableHeader + '\n' + tableRows.join('\n'));
        }

        return markdownResponse(resultParts.join('\n\n'));
      } catch (e) {
        return error(
          `Failed to load props system data: ${e instanceof Error ? e.message : String(e)}. The data files may not be built yet. Run "pnpm build" in packages/mcp first.`
        );
      }
    }
  );
}
