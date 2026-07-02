import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadPropsMarkdown } from '../lib/load-markdown.js';
import { parsePropRows, type PropRow } from '../lib/markdown-utils.js';
import { MetaInfoSchema } from '../lib/schemas.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';

/** CSS宣言 */
interface CssDeclaration {
  property: string;
  value: string;
}

/** 変換結果の1行 */
interface ConversionEntry {
  css: string;
  lismProp: string | null;
  suggestedValue: string | null;
  availableTokens: string[] | null;
  confidence: 'exact' | 'approximate' | 'unmapped';
  note: string;
}

/** コンポーネント提案 */
interface ComponentSuggestion {
  name: string;
  reason: string;
  implicitCss: string[];
}

// ----------------------------------------------------------------
// CSS パース
// ----------------------------------------------------------------

/** @ルール（@media 等）が含まれていないか検査する */
function detectAtRules(cssText: string): string | null {
  const atRuleMatch = cssText.match(/^@(\w[\w-]*)/m);
  if (atRuleMatch) {
    return `@${atRuleMatch[1]} rules are not supported. Provide plain CSS declarations (property: value;) only.`;
  }
  return null;
}

/**
 * CSS テキストから宣言を抽出する。
 * `;` で分割する際に `url()` 等の括弧内の `;` を無視する。
 */
function parseCssDeclarations(cssText: string): CssDeclaration[] {
  // コメント除去
  let cleaned = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

  // セレクタ + ブレースを除去（裸の宣言リストも受け付ける）
  cleaned = cleaned.replace(/[^{}]*\{/g, '').replace(/\}/g, '');

  // 括弧のネストを考慮して `;` で分割
  const segments: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (const ch of cleaned) {
    if (ch === '(') parenDepth++;
    if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

    if (ch === ';' && parenDepth === 0) {
      segments.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) segments.push(current.trim());

  const declarations: CssDeclaration[] = [];
  for (const segment of segments) {
    if (!segment) continue;

    const colonIdx = segment.indexOf(':');
    if (colonIdx === -1) continue;

    const property = segment.substring(0, colonIdx).trim().toLowerCase();
    const value = segment.substring(colonIdx + 1).trim();

    if (property && value) {
      declarations.push({ property, value });
    }
  }
  return declarations;
}

// ----------------------------------------------------------------
// property-class.md からのマッピング構築
// ----------------------------------------------------------------

interface PropMapping {
  prop: string;
  cssProperty: string;
  presetValues: string[];
  sectionName: string;
}

/** プリセット値列から値を抽出する（例: "-fz:base, -fz:5xl" → ["base", "5xl"]） */
function extractPresetValues(presetColumn: string, propName: string): string[] {
  if (!presetColumn || presetColumn === '—' || presetColumn === '-') return [];

  const values: string[] = [];
  // -{prop}:{value} パターンを全て抽出
  const escaped = propName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`-${escaped}:([^,\\s\`〜]+)`, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(presetColumn)) !== null) {
    values.push(match[1]);
  }
  return values;
}

function buildMappings(md: string): PropMapping[] {
  return parsePropRows(md).map((row) => ({
    prop: row.prop,
    cssProperty: row.cssProperty,
    presetValues: extractPresetValues(row.presetColumn, row.prop),
    sectionName: row.sectionName,
  }));
}

function buildCssPropertyMap(mappings: PropMapping[]): Map<string, PropMapping> {
  const map = new Map<string, PropMapping>();
  for (const mapping of mappings) {
    const normalized = mapping.cssProperty.toLowerCase();
    // CSS カスタムプロパティ形式はスキップ（"--hl" 等）
    if (!normalized.startsWith('(class:')) {
      map.set(normalized, mapping);
    }
  }
  return map;
}

// ----------------------------------------------------------------
// 値のマッピング
// ----------------------------------------------------------------

/** よくある CSS 値 → Lism トークン値の変換テーブル */
const VALUE_ALIASES: Record<string, string> = {
  'space-between': 'between',
  currentcolor: 'current',
  uppercase: 'upper',
  lowercase: 'lower',
};

function suggestValue(mapping: PropMapping, cssValue: string): string | null {
  const tokens = mapping.presetValues;
  if (tokens.length === 0) return null;

  // 直接一致
  if (tokens.includes(cssValue)) return cssValue;

  // エイリアス変換後に一致
  const aliased = VALUE_ALIASES[cssValue.toLowerCase()];
  if (aliased && tokens.includes(aliased)) return aliased;

  return null;
}

// ----------------------------------------------------------------
// コンポーネント検出
// ----------------------------------------------------------------

function detectComponent(declarations: CssDeclaration[]): ComponentSuggestion | null {
  const propMap = new Map(declarations.map((d) => [d.property, d.value.toLowerCase()]));

  const display = propMap.get('display');
  const flexDirection = propMap.get('flex-direction');
  const placeItems = propMap.get('place-items');

  // Stack: flex + column
  if (display === 'flex' && (flexDirection === 'column' || flexDirection === 'column-reverse')) {
    return {
      name: 'Stack',
      reason: 'display: flex + flex-direction: column → Stack (vertical flex)',
      implicitCss: ['display: flex', 'flex-direction: column'],
    };
  }

  // Center: grid + place-items: center
  if (display === 'grid' && placeItems === 'center') {
    return {
      name: 'Center',
      reason: 'display: grid + place-items: center → Center (centered grid)',
      implicitCss: ['display: grid', 'place-items: center'],
    };
  }

  // Flex
  if (display === 'flex') {
    return {
      name: 'Flex',
      reason: 'display: flex → Flex component',
      implicitCss: ['display: flex'],
    };
  }

  // Grid
  if (display === 'grid') {
    return {
      name: 'Grid',
      reason: 'display: grid → Grid component',
      implicitCss: ['display: grid'],
    };
  }

  return null;
}

// ----------------------------------------------------------------
// 変換メイン
// ----------------------------------------------------------------

function findCategory(mappings: PropMapping[], propName: string): string {
  const found = mappings.find((m) => m.prop === propName);
  return found?.sectionName ?? 'unknown';
}

function buildExample(conversions: ConversionEntry[], component: ComponentSuggestion | null): string {
  const tagName = component?.name ?? 'Lism';
  const implicitCssSet = new Set(component?.implicitCss.map((c) => c.split(':')[0].trim()) ?? []);

  const props: string[] = [];
  const styles: string[] = [];

  for (const conv of conversions) {
    const cssProp = conv.css.split(':')[0].trim();

    if (!conv.lismProp) {
      styles.push(conv.css);
      continue;
    }

    // コンポーネントが暗黙的に付与する CSS はスキップ
    if (implicitCssSet.has(cssProp)) continue;

    if (conv.suggestedValue != null) {
      props.push(`${conv.lismProp}='${conv.suggestedValue}'`);
    } else {
      const cssValue = conv.css.split(':').slice(1).join(':').trim();
      props.push(`${conv.lismProp}='${cssValue}'`);
    }
  }

  let result = `<${tagName}`;
  if (props.length > 0) result += ` ${props.join(' ')}`;
  if (styles.length > 0) {
    result += ` style="${styles.map((s) => s.replace(/"/g, "'")).join('; ')}"`;
  }
  result += `>...</${tagName}>`;

  return result;
}

// ----------------------------------------------------------------
// ツール登録
// ----------------------------------------------------------------

export function registerConvertCss(server: McpServer): void {
  server.registerTool(
    'convert_css',
    {
      description:
        'Convert CSS code to lism-css props, utility classes, and component suggestions. Accepts CSS declarations (with or without selectors) and returns the equivalent lism-css representation as structured JSON.\n' +
        'Use this when migrating existing CSS to lism-css in bulk, or when you need to understand how multiple CSS properties map to lism-css at once.\n' +
        'Do NOT use this for single prop lookups (use get_props_system instead). Note: @media and other at-rules are NOT supported — an error will be returned if detected.\n' +
        'Returns JSON with conversions (prop mappings with confidence), component suggestions, and a JSX usage example.',
      inputSchema: {
        css: z
          .string()
          .describe(
            'CSS code to convert. Accepts a full rule block with selector (e.g. ".foo { padding: 1rem; }") or bare declarations (e.g. "padding: 1rem; font-size: 16px;"). @media and other at-rules are not supported.'
          ),
      },
      outputSchema: {
        meta: MetaInfoSchema,
        conversions: z.array(
          z.object({
            css: z.string(),
            lismProp: z.string().nullable(),
            suggestedValue: z.string().nullable(),
            availableTokens: z.array(z.string()).nullable(),
            confidence: z.enum(['exact', 'approximate', 'unmapped']),
            note: z.string(),
          })
        ),
        suggestedComponent: z.object({ name: z.string(), reason: z.string(), implicitCss: z.array(z.string()) }).nullable(),
        example: z.string(),
        tip: z.string(),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ css }) => {
      try {
        // @ ルール検出
        const atRuleError = detectAtRules(css);
        if (atRuleError) {
          return error(atRuleError);
        }

        const md = loadPropsMarkdown();
        const mappings = buildMappings(md);
        const cssPropertyMap = buildCssPropertyMap(mappings);

        const declarations = parseCssDeclarations(css);

        if (declarations.length === 0) {
          return error('No CSS declarations found. Provide CSS in "property: value;" format.');
        }

        // 各宣言を変換
        const conversions: ConversionEntry[] = declarations.map((decl) => {
          const mapping = cssPropertyMap.get(decl.property);

          if (!mapping) {
            return {
              css: `${decl.property}: ${decl.value}`,
              lismProp: null,
              suggestedValue: null,
              availableTokens: null,
              confidence: 'unmapped' as const,
              note: 'No matching Lism prop. Specify it directly via the style attribute.',
            };
          }

          const suggested = suggestValue(mapping, decl.value);
          const category = findCategory(mappings, mapping.prop);

          return {
            css: `${decl.property}: ${decl.value}`,
            lismProp: mapping.prop,
            suggestedValue: suggested,
            availableTokens: mapping.presetValues.length > 0 ? mapping.presetValues : null,
            confidence: suggested ? ('exact' as const) : ('approximate' as const),
            note: suggested
              ? `Use token value '${suggested}' (category: ${category})`
              : mapping.presetValues.length > 0
                ? `Custom value. Available tokens: ${mapping.presetValues.join(', ')} (category: ${category})`
                : `Use as a custom value (category: ${category})`,
          };
        });

        // コンポーネント検出
        const suggestedComponent = detectComponent(declarations);

        // 使用例
        const example = buildExample(conversions, suggestedComponent);

        return success({
          conversions,
          suggestedComponent,
          example,
          tip: 'Values that do not match a token can be set as CSS variables via the style attribute (e.g. style="--p: 1rem"). Use get_props_system for details on each prop.',
        });
      } catch (e) {
        return error(`CSS conversion failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
