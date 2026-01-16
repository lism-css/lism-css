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
export type LimitedArray<T, N extends number, R extends T[] = [T]> = R['length'] extends N ? R : R | LimitedArray<T, N, [...R, T]>;

/**
 * プリセット値 | 任意文字列
 *
 * `string & {}` はリテラル型が string に吸収されるのを防ぎ、
 * エディタでプリセット値のサジェストを維持しつつ任意の値も受け付ける
 *
 * @example
 * ```ts
 * type Size = WithArbitraryValue<'s' | 'm' | 'l'>;
 * // 結果: 's' | 'm' | 'l' | (string & {})
 * // → 's', 'm', 'l' がサジェストされつつ、'custom' などの任意の値も受け付ける
 * ```
 */
export type WithArbitraryValue<T> = T | (string & {}) | (number & {}) | (boolean & {});

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
 * オブジェクトから指定したキーの配列要素の型を抽出
 * 指定したキーが存在しない場合は never を返す
 *
 * @example
 * ```ts
 * type Presets = ExtractArrayValues<{ presets: readonly ['a', 'b'] }, 'presets'>;
 * // 結果: 'a' | 'b'
 *
 * type Values = ExtractArrayValues<{ values: readonly [1, 2, 3] }, 'values'>;
 * // 結果: 1 | 2 | 3
 * ```
 */
export type ExtractArrayValues<T, K extends string> = T extends { [P in K]: readonly (infer E)[] } ? E : never;

/**
 * オブジェクトから指定したキーのオブジェクトのキーを抽出
 * 指定したキーが存在しない場合は never を返す
 *
 * @example
 * ```ts
 * type Keys = ExtractObjectKeys<{ utils: { a: 'x', b: 'y' } }, 'utils'>;
 * // 結果: 'a' | 'b'
 * ```
 */
export type ExtractObjectKeys<T, K extends string> = T extends { [P in K]: infer U } ? (U extends object ? keyof U : never) : never;

/**
 * オブジェクトから指定したキーのプロパティ値を抽出
 * 指定したキーが存在しない場合は never を返す
 *
 * @example
 * ```ts
 * type TokenKey = ExtractPropertyValue<{ token: 'fz' }, 'token'>;
 * // 結果: 'fz'
 *
 * type PropName = ExtractPropertyValue<{ prop: 'fontSize' }, 'prop'>;
 * // 結果: 'fontSize'
 * ```
 */
export type ExtractPropertyValue<T, K extends string> = T extends { [P in K]: infer V } ? V : never;
