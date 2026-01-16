import type TOKENS from '../../../config/defaults/tokens';

/**
 * config/defaults/tokens.ts から TOKENS の型を取得
 */
type TokensConfig = typeof TOKENS;

// ============================================================
// Token 設定の2つのパターン
// ============================================================
//
// 1. 配列形式 (ArrayToken) → TokenProps
//    例: fz: readonly ['root', 'base', '5xl', ...]
//
// 2. オブジェクト形式 (ObjectToken) → InternalTokenProps
//    例: space: { pre: '--s', values: readonly ['5', '10', ...] }
//
// ============================================================

// ------------------------------------------------------------
// ユーティリティ型
// ------------------------------------------------------------

/**
 * プリセット値 | 任意文字列
 *
 * `string & {}` はリテラル型が string に吸収されるのを防ぎ、
 * エディタでプリセット値のサジェストを維持しつつ任意の文字列も受け付ける
 */
type TokenValue<T> = T | (string & {});

/** 配列から要素の型を抽出 */
type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/** オブジェクトの values プロパティから要素の型を抽出 */
type ObjectValuesElement<T> = T extends { values: readonly (infer E)[] } ? E : never;

// ------------------------------------------------------------
// TokenProps（配列形式のトークン）
// ------------------------------------------------------------

/** 配列形式のトークンキーを抽出 */
type ArrayTokenKeys = {
	[K in keyof TokensConfig]: TokensConfig[K] extends readonly unknown[] ? K : never;
}[keyof TokensConfig];

/**
 * 配列形式のトークンから生成される Props 型
 *
 * @example
 * ```ts
 * type Example = {
 *   fz?: 'root' | 'base' | '5xl' | ... | (string & {});
 *   lh?: 'base' | 'xs' | 's' | 'l' | (string & {});
 *   // ...
 * }
 * ```
 */
export type TokenProps = {
	[K in ArrayTokenKeys]?: TokenValue<ArrayElement<TokensConfig[K]>>;
};

// ------------------------------------------------------------
// InternalTokenProps（オブジェクト形式のトークン）
// ------------------------------------------------------------

/** オブジェクト形式のトークンキーを抽出 */
type ObjectTokenKeys = {
	[K in keyof TokensConfig]: TokensConfig[K] extends { values: readonly unknown[] } ? K : never;
}[keyof TokensConfig];

/**
 * オブジェクト形式のトークン（space, c, palette など）から生成される Props 型
 * values プロパティの値がトークン値として使用される
 *
 * @example
 * ```ts
 * type Example = {
 *   space?: '5' | '10' | '20' | ... | (string & {});
 *   c?: 'base' | 'text' | ... | (string & {});
 *   palette?: 'red' | 'blue' | ... | (string & {});
 * }
 * ```
 */
export type InternalTokenProps = {
	[K in ObjectTokenKeys]?: TokenValue<ObjectValuesElement<TokensConfig[K]>>;
};
