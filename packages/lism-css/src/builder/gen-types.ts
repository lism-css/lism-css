/**
 * lism.config.js の breakpoints から `BreakpointRegistry` augmentation の `.d.ts` を生成する純粋関数（#427 / P4）。
 *
 * 型のデフォルト広告は sm/md/lg（`lib/types/ResponsiveProps.ts` の `BreakpointRegistry`）。
 * config で xs/xl にサイズ（≠0）を与えて有効化した分を、プロジェクト直下の `.d.ts` で
 * `declare module 'lism-css'` 拡張して型側にも解禁する。これにより #428 の手書き augmentation を不要にする。
 *
 * 副作用（ファイル書き出し）は `vite-typegen.ts` 側に分離し、ここは入力 → 文字列の純粋変換に限定する。
 */
import type { BuildConfig } from './serialize';

/** 型がデフォルトで広告済みのキー（`ResponsiveProps.ts` の `BreakpointRegistry` と一致させる）。 */
const DEFAULT_ADVERTISED = ['sm', 'md', 'lg'];

/** ランタイムが解釈できる BP キーの全集合（`config/index.ts` の `BREAK_POINTS_OBJ` から base を除いたもの）。 */
const KNOWN_BP_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'];

const HEADER = `// このファイルは lism-css が lism.config.js の breakpoints から自動生成します。
// 編集しないでください（次回の dev / build 時に上書きされます）。`;

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
 * breakpoints から `.d.ts` の内容を生成する。追加解禁キーが無ければ `null`（= ファイル不要）を返す。
 */
export function generateBreakpointDts(breakpoints: BuildConfig['breakpoints']): string | null {
  const keys = extraAdvertisedBpKeys(breakpoints);
  if (keys.length === 0) return null;

  const lines = keys.map((key) => `    ${key}: true;`).join('\n');
  return `${HEADER}
import 'lism-css';

declare module 'lism-css' {
  interface BreakpointRegistry {
${lines}
  }
}
`;
}
