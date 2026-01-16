import { TOKENS, PROPS } from '../../../config/index';
import type { WithArbitraryString, ArrayElement, ExtractArrayValues, ExtractObjectKeys, ExtractPropertyValue } from './utils';

/**
 * config/defaults/props.ts から PROPS の型を取得
 */
type PropsConfig = typeof PROPS;

/**
 * config/defaults/tokens.ts から TOKENS の型を取得
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

/**
 * PROPS 設定から生成される Props 型
 * 各プロパティは presets の値 + utils のキー + token の値 を受け付ける
 *
 * @example
 * ```ts
 * type Example = {
 *   fs?: 'italic' | (string & {});
 *   mx?: 'auto' | '0' | '5' | '10' | '20' | ... | (string & {});
 *   fz?: 'root' | 'base' | '5xl' | ... | (string & {});
 *   // ...
 * }
 * ```
 */
export type PropValueTypes = {
	[K in PropsWithValues]?: WithArbitraryString<ExtractPropValues<PropsConfig[K]>> | number | boolean;
};

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
