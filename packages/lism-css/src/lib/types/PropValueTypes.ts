import type PROPS from '../../../config/defaults/props';
import type { WithArbitraryString } from './utils';

/**
 * config/defaults/props.ts から PROPS の型を取得
 */
type PropsConfig = typeof PROPS;

// ============================================================
// Props 設定からプリセット値・ユーティリティ値の型を生成
// ============================================================
//
// presets: readonly ['italic'] → 'italic'
// utils: { none: 'none' } → 'none' (キーを取得)
//
// 例:
//   fs: { presets: ['italic'] } → fs?: 'italic' | (string & {})
//   mx: { presets: ['auto', '0'] } → mx?: 'auto' | '0' | (string & {})
//   td: { utils: { none: 'none' } } → td?: 'none' | (string & {})
//   d: { presets: ['none', 'block'], utils: { 'in-flex': 'inline-flex' } }
//      → d?: 'none' | 'block' | 'in-flex' | (string & {})
//
// ============================================================

/**
 * presets 配列から要素の型を抽出
 * presets が存在しない場合は never を返す
 */
type ExtractPresets<T> = T extends { presets: readonly (infer E)[] } ? E : never;

/**
 * utils オブジェクトからキーの型を抽出
 * utils が存在しない場合は never を返す
 */
type ExtractUtilsKeys<T> = T extends { utils: infer U } ? (U extends object ? keyof U : never) : never;

/**
 * プロパティの設定から利用可能な値の型を抽出
 * presets の値 + utils のキー
 */
type ExtractPropValues<T> = ExtractPresets<T> | ExtractUtilsKeys<T>;

/**
 * presets, utils のいずれかを持つキーを抽出
 */
type PropsWithValues = {
	[K in keyof PropsConfig]: ExtractPropValues<PropsConfig[K]> extends never ? never : K;
}[keyof PropsConfig];

/**
 * PROPS 設定から生成される Props 型
 * 各プロパティは presets の値 + utils のキー を受け付ける
 *
 * @example
 * ```ts
 * type Example = {
 *   fs?: 'italic' | (string & {});
 *   mx?: 'auto' | '0' | (string & {});
 *   d?: 'none' | 'block' | 'in-flex' | (string & {});
 *   // ...
 * }
 * ```
 */
export type PropValueTypes = {
	[K in PropsWithValues]?: WithArbitraryString<ExtractPropValues<PropsConfig[K]>>;
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
