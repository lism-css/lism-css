import { BREAK_POINTS_ALL } from '../../../config/index';
import type { LimitedArray } from './utils';

// ------------------------------------------------------------
// ブレイクポイント関連の型
// ------------------------------------------------------------

/** 全ブレイクポイントキー（'base' を含む） */
type BreakpointKey = (typeof BREAK_POINTS_ALL)[number];

/** ブレイクポイント数（5: base, sm, md, lg, xl） */
type BreakpointCount = (typeof BREAK_POINTS_ALL)['length'];

/** ブレイクポイント数を上限とする配列型（1〜5要素） */
type ResponsiveArray<T> = LimitedArray<T | null, BreakpointCount>;

/**
 * プロパティ値をレスポンシブ対応の型に変換するユーティリティ型
 *
 * 単一の値、配列形式（最大5要素）、ブレイクポイントオブジェクト形式のいずれかを受け付ける
 *
 * @example
 * ```ts
 * type FzProp = Responsive<'s' | 'm' | 'l'>;
 * // 結果:
 * // | 's' | 'm' | 'l'
 * // | ['s' | 'm' | 'l'] | ['s' | 'm' | 'l', 's' | 'm' | 'l'] | ... (最大5要素)
 * // | { base?: 's' | 'm' | 'l'; sm?: 's' | 'm' | 'l'; md?: ...; lg?: ...; xl?: ... }
 *
 * // 使用例
 * const a: FzProp = 'm';                           // 単一値
 * const b: FzProp = ['s', 'm', 'l'];               // 配列形式（最大5要素）
 * const c: FzProp = { base: 's', md: 'l' };        // オブジェクト形式
 * ```
 */
export type Responsive<T> = T | ResponsiveArray<T> | Partial<Record<BreakpointKey, T>>;

/**
 * オブジェクト型の各プロパティをレスポンシブ対応に変換するユーティリティ型
 *
 * @example
 * ```ts
 * type OriginalProps = {
 *   fz: 's' | 'm' | 'l';
 *   color: string;
 * };
 *
 * type ResponsiveProps = MakeResponsive<OriginalProps>;
 * // 結果:
 * // {
 * //   fz?: Responsive<'s' | 'm' | 'l'>;
 * //   color?: Responsive<string>;
 * // }
 * ```
 */
export type MakeResponsive<T> = {
  [K in keyof T]?: Responsive<T[K]>;
};
