import { TOKENS, PROPS } from '../../../config/index';
import type { WithArbitraryString, ArrayElement, ExtractArrayValues, ExtractObjectKeys, ExtractPropertyValue } from './utils';
import type { MakeResponsive } from './ResponsiveProps';
import type { FullModeRegistry } from './FullModeRegistry';

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
//   fz: { token: 'fz' } → fz?: 'base' | '5xl' | ... | (string & {})
//   bg: { prop: 'background', bp: 1 } → bg?: string | number  (フォールバック)
//
// ============================================================

/**
 * TOKENS のキーから対応する値の型（= トークンのキー集合）を取得
 * - 配列 / Set 形式: その要素の型
 * - 値付きフラットマップ（{ key: value }）: その keyof（トークンのキー集合）
 *
 * @example
 * ```ts
 * type FzValues = TokenConfigValues<'fz'>;
 * // 結果: 'base' | '5xl' | ...
 *
 * type SpaceValues = TokenConfigValues<'space'>;
 * // 結果: '5' | '10' | '15' | ...
 * ```
 */
type TokenConfigValues<K extends keyof TokensConfig> = TokensConfig[K] extends readonly unknown[]
  ? ArrayElement<TokensConfig[K]>
  : TokensConfig[K] extends object
    ? keyof TokensConfig[K] & string
    : never;

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
 * bp プロパティでレスポンシブ（配列・オブジェクト形式）が有効かを判定
 * - bp 未設定 / bp: 0 → false
 * - bp: 1 → 有効 BP すべてからユーティリティクラス生成
 * - bp: ['sm', 'md'] 等のリスト形式 → 列挙した BP のみ出力（型は bp: 1 と同様に許可）
 */
type HasBreakpointSupport<T> = [ExtractPropertyValue<T, 'bp'>] extends [never]
  ? false
  : ExtractPropertyValue<T, 'bp'> extends 0
    ? false
    : ExtractPropertyValue<T, 'bp'> extends 1 | readonly unknown[]
      ? true
      : false;

type AllPropKeys = keyof PropsConfig;

/**
 * bp が有効（1 またはブレークポイント名）なプロパティのキーを抽出
 */
type PropsWithBreakpoint = {
  [K in AllPropKeys]: HasBreakpointSupport<PropsConfig[K]> extends true ? K : never;
}[AllPropKeys];

/**
 * bp が無効なプロパティのキーを抽出
 */
type PropsWithoutBreakpoint = Exclude<AllPropKeys, PropsWithBreakpoint>;

/**
 * bp が有効なプロパティの型（レスポンシブ対応あり）
 */
export type ResponsivePropValueTypes = {
  [K in PropsWithBreakpoint]?: PropValueType<PropsConfig[K]>;
};

/**
 * bp が無効なプロパティの型（レスポンシブ対応なし）
 */
export type NonResponsivePropValueTypes = {
  [K in PropsWithoutBreakpoint]?: PropValueType<PropsConfig[K]>;
};

/** defaults 由来の Props 型（full モード未適用時のデフォルト） */
type DefaultPropValueTypes = MakeResponsive<ResponsivePropValueTypes> & NonResponsivePropValueTypes;

// ============================================================
// full モード（isFullMode）の型対応
// ============================================================
//
// lism.config.js の isFullMode では、isVar 系を除く全 props が responsive 化する
// （config/presets/props-full.ts のランタイム挙動）。これを型側にも反映する。
// 静的型は .js の値を読めないため、FullModeRegistry の module augmentation で opt-in する。

/**
 * isVar 系（state 変数扱い・full preset の対象外）の prop かを判定。
 * isVar 未設定の prop は `ExtractPropertyValue` が never を返す。`1 extends X` の向きで
 * 判定することで、X が never でも 1 でもない（= false）になり、tuple ラップ時の
 * `[never] extends [1]` が true に化ける罠を避ける。
 */
type IsVarProp<T> = 1 extends ExtractPropertyValue<T, 'isVar'> ? true : false;

/**
 * full モードでレスポンシブになる prop のキー。
 * - isVar 系以外: full preset が bp:1 にするため常にレスポンシブ
 * - isVar 系: props-full.ts の対象外なのでデフォルトの bp 判定のまま
 */
type FullPropsWithBreakpoint = {
  [K in AllPropKeys]: IsVarProp<PropsConfig[K]> extends true ? (HasBreakpointSupport<PropsConfig[K]> extends true ? K : never) : K;
}[AllPropKeys];

type FullPropsWithoutBreakpoint = Exclude<AllPropKeys, FullPropsWithBreakpoint>;

/** full モード適用時の Props 型（isVar 系を除く全 props がレスポンシブ） */
type FullPropValueTypes = MakeResponsive<{
  [K in FullPropsWithBreakpoint]?: PropValueType<PropsConfig[K]>;
}> & {
  [K in FullPropsWithoutBreakpoint]?: PropValueType<PropsConfig[K]>;
};

/**
 * FullModeRegistry が module augmentation で拡張されている（= キーが1つ以上ある）か。
 * 空 interface の `keyof` は never。`[never] extends [never]` の tuple ラップで
 * naked never の分配（条件型が never に潰れる）を回避している（HasBreakpointSupport と同手法）。
 */
type IsFullModeAdvertised = [keyof FullModeRegistry] extends [never] ? false : true;

/**
 * PROPS 設定から生成される Props 型（レスポンシブ対応含む）
 * - bp が有効なプロパティ: レスポンシブ対応（配列・オブジェクト形式可）
 * - bp なしのプロパティ: 単一値のみ
 * - presets/utils/token なしのプロパティ: string | number（フォールバック）
 *
 * {@link FullModeRegistry} が拡張されている場合は full 版に切り替わり、isVar 系を除く
 * 全 props がレスポンシブになる（lism.config.js の isFullMode に型を追従させるための opt-in）。
 *
 * @example
 * ```ts
 * // bp が有効なプロパティ（fz など）
 * fz?: 'base' | 'l' | ... | ['base', 'l'] | { base: 'base', md: 'l' }
 *
 * // bp なしのプロパティ（fw など）
 * fw?: 'thin' | 'light' | 'normal' | ...
 *
 * // presets/utils/token なしのプロパティ（bg など）
 * bg?: Responsive<string | number>
 * ```
 */
export type PropValueTypes = IsFullModeAdvertised extends true ? FullPropValueTypes : DefaultPropValueTypes;
