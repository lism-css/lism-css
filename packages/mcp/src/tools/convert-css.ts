import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadJSON } from '../lib/load-data.js';
import { PropsSystemDataSchema, ComponentInfoSchema } from '../lib/schemas.js';
import { success, error, READ_ONLY_ANNOTATIONS } from '../lib/response.js';
import type { PropEntry } from '../lib/types.js';

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

function parseCssDeclarations(cssText: string): CssDeclaration[] {
	// コメント除去
	let cleaned = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

	// セレクタ + ブレースを除去（裸の宣言リストも受け付ける）
	cleaned = cleaned.replace(/[^{}]*\{/g, '').replace(/\}/g, '');

	const declarations: CssDeclaration[] = [];
	for (const line of cleaned.split(';')) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		const colonIdx = trimmed.indexOf(':');
		if (colonIdx === -1) continue;

		const property = trimmed.substring(0, colonIdx).trim().toLowerCase();
		const value = trimmed.substring(colonIdx + 1).trim();

		if (property && value) {
			declarations.push({ property, value });
		}
	}
	return declarations;
}

// ----------------------------------------------------------------
// CSSプロパティ → PropEntry マップ
// ----------------------------------------------------------------

function buildCssPropertyMap(categories: { props: PropEntry[] }[]): Map<string, PropEntry> {
	const map = new Map<string, PropEntry>();
	for (const cat of categories) {
		for (const prop of cat.props) {
			const normalized = normalizeCssPropertyName(prop.cssProperty);
			if (normalized) map.set(normalized, prop);
		}
	}
	return map;
}

/** cssProperty フィールドの正規化 */
function normalizeCssPropertyName(raw: string): string | null {
	// "(class: is--container)" → スキップ（CSS プロパティではない）
	if (raw.startsWith('(class:')) return null;

	// "--hl (CSS変数)" → "--hl"
	return raw
		.replace(/\s*\(.*\)$/, '')
		.trim()
		.toLowerCase();
}

// ----------------------------------------------------------------
// 値のマッピング
// ----------------------------------------------------------------

/** よくある CSS 値 → Lism トークン値の変換テーブル */
const VALUE_ALIASES: Record<string, string> = {
	column: 'col',
	'column-reverse': 'col-r',
	'row-reverse': 'row-r',
	'space-between': 'between',
	'flex-start': 'flex-s',
	'flex-end': 'flex-e',
	currentcolor: 'cc',
	uppercase: 'upper',
	lowercase: 'lower',
};

function suggestValue(propEntry: PropEntry, cssValue: string): string | null {
	const tokens = propEntry.values;
	if (!tokens || tokens.length === 0) return null;

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
			reason: 'display: flex + flex-direction: column → Stack（縦積み Flex）',
			implicitCss: ['display: flex', 'flex-direction: column'],
		};
	}

	// Center: grid + place-items: center
	if (display === 'grid' && placeItems === 'center') {
		return {
			name: 'Center',
			reason: 'display: grid + place-items: center → Center（中央配置 Grid）',
			implicitCss: ['display: grid', 'place-items: center'],
		};
	}

	// Flex
	if (display === 'flex') {
		return {
			name: 'Flex',
			reason: 'display: flex → Flex コンポーネント',
			implicitCss: ['display: flex'],
		};
	}

	// Grid
	if (display === 'grid') {
		return {
			name: 'Grid',
			reason: 'display: grid → Grid コンポーネント',
			implicitCss: ['display: grid'],
		};
	}

	return null;
}

// ----------------------------------------------------------------
// 変換メイン
// ----------------------------------------------------------------

function findCategory(categories: { category: string; props: PropEntry[] }[], propName: string): string {
	for (const cat of categories) {
		if (cat.props.some((p) => p.prop === propName)) return cat.category;
	}
	return 'unknown';
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
				'Convert CSS code to lism-css props, utility classes, and component suggestions. Accepts CSS declarations (with or without selectors) and returns the equivalent lism-css representation. Use this to migrate existing CSS to lism-css, or to understand how CSS properties map to lism-css.',
			inputSchema: {
				css: z
					.string()
					.describe(
						'CSS code to convert. Accepts a full rule block with selector (e.g. ".foo { padding: 1rem; }") or bare declarations (e.g. "padding: 1rem; font-size: 16px;").'
					),
			},
			annotations: READ_ONLY_ANNOTATIONS,
		},
		({ css }) => {
			try {
				const propsData = loadJSON('props-system.json', PropsSystemDataSchema);
				const cssPropertyMap = buildCssPropertyMap(propsData.categories);

				const declarations = parseCssDeclarations(css);

				if (declarations.length === 0) {
					return error('CSS 宣言が見つかりません。"property: value;" 形式の CSS を入力してください。');
				}

				// 各宣言を変換
				const conversions: ConversionEntry[] = declarations.map((decl) => {
					const propEntry = cssPropertyMap.get(decl.property);

					if (!propEntry) {
						return {
							css: `${decl.property}: ${decl.value}`,
							lismProp: null,
							suggestedValue: null,
							availableTokens: null,
							note: 'Lism Props に該当なし。style で直接指定してください。',
						};
					}

					const suggested = suggestValue(propEntry, decl.value);
					const category = findCategory(propsData.categories, propEntry.prop);

					return {
						css: `${decl.property}: ${decl.value}`,
						lismProp: propEntry.prop,
						suggestedValue: suggested,
						availableTokens: propEntry.values ?? null,
						note: suggested
							? `トークン値 '${suggested}' を使用（カテゴリ: ${category}）`
							: propEntry.values && propEntry.values.length > 0
								? `カスタム値。利用可能なトークン: ${propEntry.values.join(', ')}（カテゴリ: ${category}）`
								: `カスタム値として指定（カテゴリ: ${category}）`,
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
					tip: 'トークン値にマッチしない値は style 属性で CSS 変数として指定できます（例: style="--p: 1rem"）。get_props_system で各 prop の詳細を確認できます。',
				} as unknown as Record<string, unknown>);
			} catch (e) {
				return error(`CSS 変換に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	);
}
