import type { STATES } from '../../../config/index';
import type { WithArbitraryString, ArrayElement } from './utils';

/**
 * config/index.ts から STATES の型を取得
 * objDeepMerge の DeepMergeResult 型により literal types が保持される
 */
type StatesConfig = typeof STATES;

// ============================================================
// State 設定の2つのパターン
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
// ============================================================

/** preset を持つ State の値の型を抽出 */
type PresetElement<T> = T extends { preset: readonly unknown[] } ? ArrayElement<T['preset']> : never;

/**
 * State 設定から Props の値の型を抽出するユーティリティ型
 */
type ExtractStateValue<T> = T extends string
  ? boolean // 文字列形式 → boolean のみ
  : T extends { preset: readonly unknown[] }
    ? WithArbitraryString<PresetElement<T>> | boolean // preset あり → プリセット値 | 任意文字列 | boolean
    : never;

/**
 * config/index.ts の STATES から自動生成される State Props の型
 * config/index.ts の STATES に新しいステートを追加すると自動的に反映される
 */
export type StateProps = {
  [K in keyof StatesConfig]?: ExtractStateValue<StatesConfig[K]>;
};

/** set prop で使われるプリセット値（エディタ補完用） */
type SetPreset = 'gutter' | 'shadow' | 'hov' | 'transition' | 'mask' | 'plain' | 'innerRs' | 'bp';

/**
 * set prop の値の型。プリセット値がサジェストされつつ、任意の文字列も受け付ける。
 *
 * - 値はスペース区切りで複数指定可能
 * - 先頭に `-` を付けると、その識別子を除外する（例: `set="card -bd"`）
 */
export type SetPropValue = WithArbitraryString<SetPreset>;

/** util prop で使われるプリセット値（既知の `u--` クラス名・エディタ補完用） */
type UtilPreset = 'cbox' | 'trim' | 'trimChildren' | 'srOnly' | 'clipText' | 'collapseGrid' | 'snap';

/**
 * util prop の値の型。既知の `u--` クラス名がサジェストされつつ、任意の文字列も受け付ける。
 *
 * - 値はスペース区切りで複数指定可能
 * - 先頭に `-` を付けると、その識別子を除外する（例: `util="cbox -trim"`）
 */
export type UtilPropValue = WithArbitraryString<UtilPreset>;
