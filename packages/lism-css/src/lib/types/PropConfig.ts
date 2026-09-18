import { type BreakpointKey } from '../../../config/defaults/breakpoints';

/** ランタイム側の prop 設定（config/defaults/props.ts の Set 化後の形）。config 執筆用の型は config/types.ts 側。 */
export interface PropConfig {
  prop?: string;
  token?: string | null | undefined | false;
  tokenClass?: 0 | 1;
  presets?: Set<string> | string[] | readonly string[];
  presetClass?: string;
  utils?: Record<string, string>;
  shorthands?: Record<string, string>;
  isVar?: number;
  // 0 / 1（有効BPすべて）/ ['sm','md'] 等（出力する BP の明示リスト）
  bp?: 0 | 1 | readonly BreakpointKey[];
  alwaysVar?: number;
  important?: number;
  exUtility?: Record<string, unknown>;
  customVar?: string;
  setStyles?: (val: unknown) => Record<string, string | number | undefined>;
  className?: string;
  utilKey?: string;
  [key: string]: unknown;
}
