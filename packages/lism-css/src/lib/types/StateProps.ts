import type { STATES } from '../../../config/index';
import type { WithArbitraryValue, ArrayElement } from './utils';

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

/** preset を持つ State の値の型を抽出 */
type PresetElement<T> = T extends { preset: readonly unknown[] } ? ArrayElement<T['preset']> : never;

/**
 * State 設定から Props の値の型を抽出するユーティリティ型
 */
type ExtractStateValue<T> = T extends string
	? boolean // 文字列形式 → boolean のみ
	: T extends { preset: readonly unknown[] }
		? WithArbitraryValue<PresetElement<T>> | boolean // preset あり → プリセット値 | 任意文字列 | boolean
		: T extends { setStyles: unknown }
			? string // setStyles あり → 文字列のみ
			: never;

/**
 * config/index.ts の STATES から自動生成される State Props の型
 * config/index.ts の STATES に新しいステートを追加すると自動的に反映される
 */
export type StateProps = {
	[K in keyof StatesConfig]?: ExtractStateValue<StatesConfig[K]>;
};
