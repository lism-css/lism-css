import type { STATES } from '../../../config/index';

/**
 * config/index.ts から STATES の型を取得
 * objDeepMerge の DeepMergeResult 型により literal types が保持される
 */
type StatesConfig = typeof STATES;

// ============================================================
// State 設定の3つのパターン
// ============================================================
//
// 1. 文字列形式 (SimpleState)
//    例: isContainer: 'is--container'
//    → boolean のみ受け付ける（true/false でクラスの付与を制御）
//
// 2. preset あり (PresetState)
//    例: isWrapper: { className: 'is--wrapper', preset: ['s', 'l'], ... }
//    → プリセット値がサジェストされつつ、任意の文字列も受け付ける
//
// 3. setStyles あり (CustomStyleState)
//    例: setMask: { className: 'set-mask', setStyles: (val) => ({ '--maskImg': val }) }
//    → 文字列のみ受け付ける（値がスタイルに変換される）
//
// ============================================================

/**
 * 文字列形式の State → boolean のみ
 * 例: isContainer: 'is--container' → isContainer?: boolean
 */
type SimpleStateValue = boolean;

/**
 * preset を持つ State → プリセット値 | 任意文字列 | boolean
 *
 * `string & {}` は TypeScript のテクニックで、リテラル型（P）が string に
 * 吸収されるのを防ぎ、エディタでプリセット値のサジェストを維持しつつ
 * 任意の文字列も受け付けられるようにする
 */
type PresetStateValue<P> = P | (string & {}) | boolean;

/**
 * setStyles を持つ State → 文字列のみ
 * 例: setMask: { setStyles: fn } → setMask?: string
 */
type CustomStyleStateValue = string;

/**
 * State 設定から Props の値の型を抽出するユーティリティ型
 */
type ExtractStateValue<T> =
	T extends string
		? SimpleStateValue
		: T extends { preset: readonly (infer P)[] }
			? PresetStateValue<P>
			: T extends { setStyles: unknown }
				? CustomStyleStateValue
				: never;
/**
 * config/index.ts の STATES から自動生成される State Props の型
 * config/index.ts の STATES に新しいステートを追加すると自動的に反映される
 */
export type StateProps = {
	[K in keyof StatesConfig]?: ExtractStateValue<StatesConfig[K]>;
};
