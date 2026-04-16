import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getGuideFilenames, loadMarkdown } from '../lib/load-markdown.js';
import { findComponentByHeading, findComponentInTables } from '../lib/markdown-utils.js';
import { markdownResponse, error, notFound, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

/** 入力を正規化してエイリアス検索のキーに変換する。
 *  `<Flex>` / `Flex` / `l--flex` / `flex` をすべて `flex` に揃える。 */
function normalizeComponentKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^<|>$/g, '')
    .replace(/^(l--|is--|a--|c--)/, '');
}

/** 入力が `<ComponentName>` 形式（React コンポーネントとしての問い合わせ）か判定する */
function isAngleBracketNotation(input: string): boolean {
  return /^<[^<>]+>$/.test(input.trim());
}

/** primitives/*.md の先頭行 `# l--flex / \`<Flex>\`` からクラス名とコンポーネント名を抽出する */
function parsePrimitiveHeading(md: string): { className: string; componentName?: string } | null {
  const firstLine = md.split('\n', 1)[0] ?? '';
  const match = firstLine.match(/^#\s+((?:l|is|a|c)--[A-Za-z0-9]+)(?:\s*\/\s*`<([A-Za-z0-9]+)>`)?/);
  if (!match) return null;
  return { className: match[1], componentName: match[2] };
}

let classAliasMap: Map<string, string> | null = null;
let componentAliasMap: Map<string, string> | null = null;

/** primitives/*.md を走査して、クラス名由来 / React コンポーネント名由来の alias map を構築する（遅延初期化・キャッシュ）。
 *  angle-bracket 形式の問い合わせには componentAliasMap のみを照合し、
 *  クラス専用プリミティブへの false positive を避けるために分離している。 */
function buildAliasMaps(): void {
  if (classAliasMap && componentAliasMap) return;
  const classMap = new Map<string, string>();
  const componentMap = new Map<string, string>();
  for (const filename of getGuideFilenames()) {
    if (!filename.startsWith('primitives/')) continue;
    const parsed = parsePrimitiveHeading(loadMarkdown(filename));
    if (!parsed) continue;
    classMap.set(normalizeComponentKey(parsed.className), filename);
    if (parsed.componentName) {
      componentMap.set(normalizeComponentKey(parsed.componentName), filename);
    }
  }
  classAliasMap = classMap;
  componentAliasMap = componentMap;
}

function getClassAliasMap(): Map<string, string> {
  buildAliasMaps();
  return classAliasMap!;
}

function getComponentAliasMap(): Map<string, string> {
  buildAliasMaps();
  return componentAliasMap!;
}

export function registerGetComponent(server: McpServer): void {
  server.registerTool(
    'get_component',
    {
      description:
        'Get detailed information about a specific lism-css component: purpose, props, and usage examples.\n' +
        'Use this when you need documentation for a known component by name (e.g. "Box", "Flex", "Accordion", "Lism", "HTML").\n' +
        'Accepts multiple notations: "Flex", "<Flex>", "l--flex", "flex" all resolve to the same entry.\n' +
        'Do NOT use this for broad topic guides (use get_guide with "components-core" or "components-ui") or keyword search across all docs (use search_docs).\n' +
        'If the component is not found, suggestions will be provided — follow up with search_docs for a broader query.\n' +
        'The response is pre-formatted Markdown. Output it verbatim. Do NOT summarize or omit code examples.',
      inputSchema: {
        name: z.string().describe('Component name to look up (e.g. "Box", "Flex", "Accordion", "l--flex", "<Flex>").'),
        package: z
          .enum(['lism-css', '@lism-css/ui'])
          .optional()
          .describe('Filter by package. "lism-css" for core components, "@lism-css/ui" for UI components.'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ name, package: pkg }) => {
      try {
        const normalizedKey = normalizeComponentKey(name);
        const rawLower = name.toLowerCase();
        const isAngle = isAngleBracketNotation(name);

        // --- 1) lism-css コア: primitives/ の個別ファイルを alias map で解決 ---
        //   angle-bracket 形式 (`<Vertical>`) は React コンポーネント alias のみと照合し、
        //   クラス専用プリミティブへの false positive を避ける。
        if (!pkg || pkg === 'lism-css') {
          const componentHit = getComponentAliasMap().get(normalizedKey);
          if (componentHit) {
            return markdownResponse(loadMarkdown(componentHit));
          }
          if (!isAngle) {
            const classHit = getClassAliasMap().get(normalizedKey);
            if (classHit) {
              return markdownResponse(loadMarkdown(classHit));
            }
          }
        }

        // --- 2) lism-css コア: components-core.md のセマンティック/コアコンポーネント ---
        if (!pkg || pkg === 'lism-css') {
          const coreMd = loadMarkdown('components-core.md');

          // 見出しにコンポーネント名を含むセクションを検索（Lism, HTML 等）
          const coreLines = coreMd.split('\n');
          const headingLine = coreLines.find((l) => /^#{2,3}\s/.test(l) && l.toLowerCase().includes(`<${rawLower}>`));
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

        // --- 3) @lism-css/ui: components-ui.md を検索 ---
        if (!pkg || pkg === '@lism-css/ui') {
          const uiMd = loadMarkdown('components-ui.md');

          // ## ComponentName 形式の見出しで検索（完全一致）
          const uiSection = findComponentByHeading(uiMd, name);
          if (uiSection) {
            return markdownResponse(uiSection);
          }

          // 大文字小文字を無視した見出し検索
          const uiLines = uiMd.split('\n');
          const headingLine = uiLines.find((l) => l.startsWith('## ') && l.slice(3).trim().toLowerCase() === rawLower);
          if (headingLine) {
            const section = findComponentByHeading(uiMd, headingLine.slice(3).trim());
            if (section) return markdownResponse(section);
          }
        }

        // --- 4) 部分一致で候補を提示 ---
        const uiMd = loadMarkdown('components-ui.md');
        const coreMd = loadMarkdown('components-core.md');

        const moduleCandidates: string[] = [];
        if (!pkg || pkg === 'lism-css') {
          const seenFiles = new Set<string>();
          for (const map of [getComponentAliasMap(), getClassAliasMap()]) {
            for (const [key, file] of map) {
              if (key.includes(normalizedKey) && !seenFiles.has(file)) {
                seenFiles.add(file);
                moduleCandidates.push(file.replace(/^primitives\//, '').replace(/\.md$/, ''));
              }
            }
          }
        }

        const coreCandidates: string[] = [];
        if (!pkg || pkg === 'lism-css') {
          for (const line of coreMd.split('\n')) {
            if (line.startsWith('|') && line.toLowerCase().includes(rawLower)) {
              const match = line.match(/`<([^>]+)>`/);
              if (match) coreCandidates.push(match[1]);
            }
          }
        }

        const uiCandidates: string[] = [];
        if (!pkg || pkg === '@lism-css/ui') {
          for (const l of uiMd.split('\n')) {
            if (l.startsWith('## ') && l.toLowerCase().includes(rawLower)) {
              uiCandidates.push(l.slice(3).trim());
            }
          }
        }

        const suggestions = [...new Set([...moduleCandidates, ...coreCandidates, ...uiCandidates])];
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
