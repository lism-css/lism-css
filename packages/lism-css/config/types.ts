/**
 * `lism.config.*` を書く側の静的型。`lism-css/config-types` として公開する。
 *
 * 使い方:
 * - `.ts`: `export default { ... } satisfies LismConfig`（typo 検出・補完・literal 保持）
 * - `.js`: `/** @type {import('lism-css/config-types').LismConfig} *\/`
 *
 * - `lism-env.d.ts`（ビルド時生成物）や副作用付きの `config/index.ts` には依存しない。
 * - typo 検出が目的なので index signature は付けない（object literal の excess property check を効かせる）。
 * - ランタイム側の `PropConfig`（`src/lib/getLismProps.ts` の Set 化後の形）とは別物。
 */

// BreakpointKey は breakpoints.ts に一本化した定義を re-export する（二重定義を避ける）。
export type { BreakpointKey } from './defaults/breakpoints';
import type { BreakpointKey } from './defaults/breakpoints';

/** prop 1 件分の設定（config 執筆時の形）。 */
export interface PropConfig {
  prop?: string;
  token?: string;
  tokenClass?: 0 | 1;
  presets?: readonly (string | number)[];
  utils?: Record<string, string | number>;
  shorthands?: Record<string, string>;
  isVar?: 0 | 1;
  bp?: 0 | 1 | readonly BreakpointKey[];
  alwaysVar?: 0 | 1;
  important?: 0 | 1;
  // 値が空文字（センチネル: キーだけ登録）か、プロパティ名→値の Record のいずれか。
  exUtility?: Record<string, string | Record<string, string>>;
}

/** `lism.config.*` の default export（および `window._LISM_CSS_CONFIG_`）の型。 */
export interface LismConfig {
  tokens?: Record<string, Record<string, string | number> | readonly (string | number)[]>;
  props?: Record<string, PropConfig>;
  traits?: Record<string, string>;
  breakpoints?: Partial<Record<BreakpointKey, string | number>>;
  defaultImportant?: boolean;
  isFullMode?: boolean;
  /** lism-cli の UI 設定。スキーマは lism-cli 側が管理するため緩い型にとどめる。 */
  ui?: Record<string, unknown>;
}
