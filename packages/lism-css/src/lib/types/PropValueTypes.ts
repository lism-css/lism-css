import { TOKENS, PROPS } from '../../../config/index';
import type { WithArbitraryString, ArrayElement, ExtractArrayValues, ExtractObjectKeys, ExtractPropertyValue } from './utils';
import type { MakeResponsive } from './ResponsiveProps';

type PropsConfig = typeof PROPS;
type TokensConfig = typeof TOKENS;

// ============================================================
// Props 設定からプリセット値・ユーティリティ値・トークン値の型を生成
// ============================================================
//
// presets: readonly ['italic'] → 'italic'
// utils: { none: 'none' } → 'none' (キーを取得)
// token: 'fz' → TOKENS['fz'] の値を取得
//
// 例:
//   fs: { presets: ['italic'] } → fs?: 'italic' | (string & {})
//   mx: { presets: ['auto', '0'], token: 'space' } → mx?: 'auto' | '0' | '5' | '10' | ... | (string & {})
//   fz: { token: 'fz' } → fz?: 'root' | 'base' | '5xl' | ... | (string & {})
//   bg: { prop: 'background', bp: 1 } → bg?: string | number  (フォールバック)
//
// ============================================================

/**
 * TOKENS のキーから対応する値の型を取得
 * - 配列形式: TOKENS[K] が配列の場合、その要素の型
 * - オブジェクト形式: TOKENS[K].values が配列の場合、その要素の型
 *
 * @example
 * ```ts
 * type FzValues = TokenConfigValues<'fz'>;
 * // 結果: 'root' | 'base' | '5xl' | ...
 *
 * type SpaceValues = TokenConfigValues<'space'>;
 * // 結果: '5' | '10' | '15' | ...
 * ```
 */
type TokenConfigValues<K extends keyof TokensConfig> = TokensConfig[K] extends readonly unknown[]
  ? ArrayElement<TokensConfig[K]>
  : ExtractArrayValues<TokensConfig[K], 'values'>;

/**
 * token プロパティから対応する TOKENS の値を抽出
 */
type ExtractTokenValues<T> =
  ExtractPropertyValue<T, 'token'> extends never
    ? never
    : ExtractPropertyValue<T, 'token'> extends keyof TokensConfig
      ? TokenConfigValues<ExtractPropertyValue<T, 'token'>>
      : never;

/**
 * プロパティの設定から利用可能な値の型を抽出
 * presets の値 + utils のキー + token の値
 */
type ExtractPropValues<T> = ExtractArrayValues<T, 'presets'> | ExtractObjectKeys<T, 'utils'> | ExtractTokenValues<T>;

// ============================================================
// プロパティ値の型決定
// ============================================================

/**
 * プロパティの設定から値の型を決定
 * - presets/utils/token がある場合: 具体的な値 + 任意文字列 + number | boolean | null
 * - ない場合: string | number（フォールバック）
 */
type PropValueType<T> =
  ExtractPropValues<T> extends never ? string | number | boolean : WithArbitraryString<ExtractPropValues<T>> | number | boolean | null;

// ============================================================
// ブレイクポイント対応の判定
// ============================================================

/**
 * bp プロパティが 1 に設定されているかを判定
 * never チェックを先に行うことで、bp プロパティが存在しない場合を正しく判定
 */
type HasBreakpointSupport<T> = [ExtractPropertyValue<T, 'bp'>] extends [never] ? false : ExtractPropertyValue<T, 'bp'> extends 1 ? true : false;

type AllPropKeys = keyof PropsConfig;

/**
 * bp: 1 が設定されているプロパティのキーを抽出
 */
type PropsWithBreakpoint = {
  [K in AllPropKeys]: HasBreakpointSupport<PropsConfig[K]> extends true ? K : never;
}[AllPropKeys];

/**
 * bp: 1 が設定されていないプロパティのキーを抽出
 */
type PropsWithoutBreakpoint = Exclude<AllPropKeys, PropsWithBreakpoint>;

/**
 * bp: 1 が設定されているプロパティの型（レスポンシブ対応あり）
 */
export type ResponsivePropValueTypes = {
  [K in PropsWithBreakpoint]?: PropValueType<PropsConfig[K]>;
};

/**
 * bp: 1 が設定されていないプロパティの型（レスポンシブ対応なし）
 */
export type NonResponsivePropValueTypes = {
  [K in PropsWithoutBreakpoint]?: PropValueType<PropsConfig[K]>;
};

/**
 * PROPS 設定から生成される Props 型（レスポンシブ対応含む）
 * - bp: 1 のプロパティ: レスポンシブ対応（配列・オブジェクト形式可）
 * - bp なしのプロパティ: 単一値のみ
 * - presets/utils/token なしのプロパティ: string | number（フォールバック）
 *
 * @example
 * ```ts
 * // bp: 1 のプロパティ（fz など）
 * fz?: 'root' | 'base' | ... | ['root', 'base'] | { base: 'root', md: 'base' }
 *
 * // bp なしのプロパティ（fw など）
 * fw?: 'thin' | 'light' | 'normal' | ...
 *
 * // presets/utils/token なしのプロパティ（bg など）
 * bg?: Responsive<string | number>
 * ```
 */
export type PropValueTypes = MakeResponsive<ResponsivePropValueTypes> & NonResponsivePropValueTypes;
