import type { STATES } from '../../../config/index';

/**
 * config/index.ts から STATES の型を取得
 * objDeepMerge の DeepMergeResult 型により literal types が保持される
 */
type StatesConfig = typeof STATES;

/**
 * ステート値の型を抽出するユーティリティ型
 * - 文字列形式 → boolean
 * - プリセット値あり → プリセットリテラル | string | boolean（プリセット以外も許可）
 * - 関数処理 → string
 *
 */
type ExtractStateValue<T> = T extends string
	? boolean
	: T extends { preset: readonly (infer P)[] }
		? P | (string & {}) | boolean // `string & {}` により任意の文字列を許可しつつ P のサジェストを維持
		: T extends { setStyles: unknown }
			? string
			: never;
/**
 * states.ts から自動生成される State Props の型
 * states.ts に新しいステートを追加すると自動的に反映される
 */
export type StateProps = {
	[K in keyof StatesConfig]?: ExtractStateValue<StatesConfig[K]>;
};
