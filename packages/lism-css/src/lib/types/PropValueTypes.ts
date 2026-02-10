import { TOKENS, PROPS } from '../../../config/index';
import type { WithArbitraryString, ArrayElement, ExtractArrayValues, ExtractObjectKeys, ExtractPropertyValue } from './utils';
import type { MakeResponsive } from './ResponsiveProps';

/**
 * config/defaults/props.ts から PROPS の型を取得
 * NOTE: config/index.ts からインポートすると structuredClone や objDeepMerge で型が widening されるため、
 * 型定義には defaults から直接インポートする
 */
type PropsConfig = typeof PROPS;

/**
 * config/defaults/tokens.ts から TOKENS の型を取得
 * NOTE: config/index.ts からインポートすると structuredClone や objDeepMerge で型が widening されるため、
 * 型定義には defaults から直接インポートする
 */
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

/**
 * presets, utils, token のいずれかを持つキーを抽出
 */
type PropsWithValues = {
	[K in keyof PropsConfig]: ExtractPropValues<PropsConfig[K]> extends never ? never : K;
}[keyof PropsConfig];

// 旧 PropValueTypes は廃止: レスポンシブ対応を含む新しい PropValueTypes を使用してください

// ============================================================
// すべてのプロパティキーの型（値の制約なし）
// ============================================================

/**
 * PROPS に定義されているすべてのプロパティキー
 */
export type PropKeys = keyof PropsConfig;

/**
 * PROPS に定義されているすべてのプロパティを任意の文字列値で受け付ける型
 */
export type AllPropTypes = {
	[K in PropKeys]?: string;
};

// ============================================================
// ブレイクポイント対応の判定
// ============================================================

/**
 * bp プロパティが 1 に設定されているかを判定
 * never チェックを先に行うことで、bp プロパティが存在しない場合を正しく判定
 */
type HasBreakpointSupport<T> = [ExtractPropertyValue<T, 'bp'>] extends [never] ? false : ExtractPropertyValue<T, 'bp'> extends 1 ? true : false;

/**
 * bp: 1 が設定されており、かつ値を持つプロパティのキーを抽出
 */
type PropsWithBreakpoint = {
	[K in PropsWithValues]: HasBreakpointSupport<PropsConfig[K]> extends true ? K : never;
}[PropsWithValues];

/**
 * bp: 1 が設定されておらず、かつ値を持つプロパティのキーを抽出
 */
type PropsWithoutBreakpoint = Exclude<PropsWithValues, PropsWithBreakpoint>;

/**
 * bp: 1 が設定されているプロパティの型（レスポンシブ対応あり）
 */
export type ResponsivePropValueTypes = {
	[K in PropsWithBreakpoint]?: WithArbitraryString<ExtractPropValues<PropsConfig[K]>> | number | boolean;
};

/**
 * bp: 1 が設定されていないプロパティの型（レスポンシブ対応なし）
 */
export type NonResponsivePropValueTypes = {
	[K in PropsWithoutBreakpoint]?: WithArbitraryString<ExtractPropValues<PropsConfig[K]>> | number | boolean;
};

/**
 * PROPS 設定から生成される Props 型（レスポンシブ対応含む）
 * - bp: 1 のプロパティ: レスポンシブ対応（配列・オブジェクト形式可）
 * - bp なしのプロパティ: 単一値のみ
 *
 * @example
 * ```ts
 * // bp: 1 のプロパティ（fz など）
 * fz?: 'root' | 'base' | ... | ['root', 'base'] | { base: 'root', md: 'base' }
 *
 * // bp なしのプロパティ（fw など）
 * fw?: 'thin' | 'light' | 'normal' | ...
 * ```
 */
export type PropValueTypes = MakeResponsive<ResponsivePropValueTypes> & NonResponsivePropValueTypes;
