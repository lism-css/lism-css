/**
 * lism.config.js の breakpoints / props から module augmentation の `.d.ts` を生成する純粋関数（#427 / P4-P5）。
 *
 * 型のデフォルト広告は sm/md/lg（`lib/types/ResponsiveProps.ts` の `BreakpointRegistry`）。
 * config で xs/xl にサイズ（≠0）を与えて有効化した分を、プロジェクト直下の `.d.ts` で
 * `declare module 'lism-css'` 拡張して型側にも解禁する。これにより #428 の手書き augmentation を不要にする。
 * さらに、lism.config.js で追加された props は `CustomPropRegistry` 拡張として並べて出力する。
 *
 * 副作用（ファイル書き出し）は `vite-typegen.ts` 側に分離し、ここは入力 → 文字列の純粋変換に限定する。
 */
import type { BuildConfig } from './serialize';

/** 型がデフォルトで広告済みのキー（`ResponsiveProps.ts` の `BreakpointRegistry` と一致させる）。 */
const DEFAULT_ADVERTISED = ['sm', 'md', 'lg'];

/** ランタイムが解釈できる BP キーの全集合（`config/index.ts` の `BREAK_POINTS_OBJ` から base を除いたもの）。 */
const KNOWN_BP_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'];

/** 自動生成物であることを示す識別マーカー。HEADER に埋め込み、削除時の安全判定にも使う。 */
export const GENERATED_MARKER = 'このファイルは lism-css が';

const HEADER = `// ${GENERATED_MARKER} lism.config.js の breakpoints / props から自動生成します。
// 編集しないでください（次回の dev / build 時に上書きされます）。`;

const CUSTOM_PROP_VALUE_TYPE = 'CustomPropValue';

/** breakpoints のサイズが「有効」か（0 / 未定義 / 空文字 / '0' は無効）。 */
function isActiveSize(size: string | number | undefined): boolean {
  return !!size && size !== '0';
}

/**
 * 型で追加解禁すべきキー = 「有効（サイズ≠0）かつデフォルト広告外」の既知 BP キー。
 * 既知キー（xs/sm/md/lg/xl）に限定し、ランタイム非対応の独自キーは広告しない。
 */
export function extraAdvertisedBpKeys(breakpoints: BuildConfig['breakpoints']): string[] {
  if (!breakpoints) return [];
  return KNOWN_BP_KEYS.filter((key) => !DEFAULT_ADVERTISED.includes(key) && isActiveSize(breakpoints[key]));
}

/**
 * props で追加解禁すべきキー = 「マージ後 props にあり、default-config には無い」キー。
 * 既定 prop との衝突を避け、lism.config.js で新設された prop だけを型へ広告する。
 */
export function extraCustomPropKeys(props: BuildConfig['props'] | undefined, defaultPropKeys: Iterable<string>): string[] {
  if (!props) return [];
  const defaults = new Set(defaultPropKeys);
  return Object.keys(props).filter((key) => !defaults.has(key));
}

function formatTypePropertyKey(key: string): string {
  return /^[$A-Z_a-z][$\w]*$/.test(key) ? key : JSON.stringify(key);
}

function generateBreakpointBlock(keys: string[]): string | null {
  if (keys.length === 0) return null;
  const lines = keys.map((key) => `    ${key}: true;`).join('\n');
  return `  interface BreakpointRegistry {
${lines}
  }`;
}

function generateCustomPropBlock(keys: string[]): string | null {
  if (keys.length === 0) return null;
  const lines = keys.map((key) => `    ${formatTypePropertyKey(key)}?: ${CUSTOM_PROP_VALUE_TYPE};`).join('\n');
  return `  interface CustomPropRegistry {
${lines}
  }`;
}

/**
 * breakpoints / props から `.d.ts` の内容を生成する。追加解禁キーが無ければ `null`（= ファイル不要）を返す。
 */
export function generateLismEnvDts(mainConfig: Pick<BuildConfig, 'breakpoints' | 'props'>, defaultPropKeys: Iterable<string>): string | null {
  const bpKeys = extraAdvertisedBpKeys(mainConfig.breakpoints);
  const propKeys = extraCustomPropKeys(mainConfig.props, defaultPropKeys);
  if (bpKeys.length === 0 && propKeys.length === 0) return null;

  const blocks = [generateBreakpointBlock(bpKeys), generateCustomPropBlock(propKeys)].filter((block): block is string => block !== null).join('\n\n');
  const imports = propKeys.length > 0 ? "import 'lism-css';\nimport type { CustomPropValue } from 'lism-css';" : "import 'lism-css';";
  return `${HEADER}
${imports}

declare module 'lism-css' {
${blocks}
}
`;
}
