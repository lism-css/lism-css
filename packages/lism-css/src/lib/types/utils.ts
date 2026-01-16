// ------------------------------------------------------------
// 汎用ユーティリティ型
// ------------------------------------------------------------

/**
 * 最大 N 要素の配列型を生成するユーティリティ型
 *
 * @example
 * ```ts
 * type Max3 = LimitedArray<string, 3>;
 * // 結果: [string] | [string, string] | [string, string, string]
 * ```
 */
export type LimitedArray<T, N extends number, R extends T[] = [T]> = R['length'] extends N
	? R
	: R | LimitedArray<T, N, [...R, T]>;

/**
 * プリセット値 | 任意文字列
 *
 * `string & {}` はリテラル型が string に吸収されるのを防ぎ、
 * エディタでプリセット値のサジェストを維持しつつ任意の文字列も受け付ける
 *
 * @example
 * ```ts
 * type Size = WithArbitraryString<'s' | 'm' | 'l'>;
 * // 結果: 's' | 'm' | 'l' | (string & {})
 * // → 's', 'm', 'l' がサジェストされつつ、'custom' などの任意文字列も受け付ける
 * ```
 */
export type WithArbitraryString<T> = T | (string & {});

/**
 * 配列から要素の型を抽出
 *
 * @example
 * ```ts
 * type Element = ArrayElement<readonly ['a', 'b', 'c']>;
 * // 結果: 'a' | 'b' | 'c'
 * ```
 */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/**
 * オブジェクトの values プロパティから要素の型を抽出
 *
 * @example
 * ```ts
 * type Values = ObjectValuesElement<{ values: readonly ['a', 'b'] }>;
 * // 結果: 'a' | 'b'
 * ```
 */
export type ObjectValuesElement<T> = T extends { values: readonly (infer E)[] } ? E : never;
