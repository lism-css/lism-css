import type { TRAITS } from '../../../config/index';
import type { WithArbitraryString, ArrayElement } from './utils';

/**
 * config/index.ts から TRAITS の型を取得
 * objDeepMerge の DeepMergeResult 型により literal types が保持される
 */
type TraitsConfig = typeof TRAITS;

// ============================================================
// Trait 設定の2つのパターン
// ============================================================
//
// 1. 文字列形式 (SimpleTrait)
//    例: isContainer: 'is--container'
//    → boolean のみ受け付ける（true/false でクラスの付与を制御）
//
// 2. preset あり (PresetTrait)
//    例: isWrapper: { className: 'is--wrapper', preset: ['s', 'l'], ... }
//    → プリセット値がサジェストされつつ、任意の文字列も受け付ける
//
// ============================================================

/** preset を持つ Trait の値の型を抽出 */
type PresetElement<T> = T extends { preset: readonly unknown[] } ? ArrayElement<T['preset']> : never;

/**
 * Trait 設定から Props の値の型を抽出するユーティリティ型
 */
type ExtractTraitValue<T> = T extends string
  ? boolean // 文字列形式 → boolean のみ
  : T extends { preset: readonly unknown[] }
    ? WithArbitraryString<PresetElement<T>> | boolean // preset あり → プリセット値 | 任意文字列 | boolean
    : never;

/**
 * config/index.ts の TRAITS から自動生成される Trait Props の型
 * config/index.ts の TRAITS に新しいトレイトを追加すると自動的に反映される
 */
export type TraitProps = {
  [K in keyof TraitsConfig]?: ExtractTraitValue<TraitsConfig[K]>;
};

/** set prop で使われるプリセット値（エディタ補完用） */
type SetPreset = 'shadow' | 'hov' | 'mask' | 'plain' | 'innerRs';

/**
 * set prop の値の型。プリセット値がサジェストされつつ、任意の文字列も受け付ける。
 *
 * - 値はスペース区切りで複数指定可能
 * - 先頭に `-` を付けると、その識別子を除外する（例: `set="card -bd"`）
 * - 文字列配列も受け付けるが、これは内部 API 用途（lism-ui など）であり、
 *   ユーザー向けドキュメントでは紹介していない
 */
export type SetPropValue = WithArbitraryString<SetPreset> | WithArbitraryString<SetPreset>[];

/** util prop で使われるプリセット値（既知の `u--` クラス名・エディタ補完用） */
type UtilPreset = 'cbox' | 'trim' | 'trimChildren' | 'srOnly' | 'clipText' | 'collapseGrid';

/**
 * util prop の値の型。既知の `u--` クラス名がサジェストされつつ、任意の文字列も受け付ける。
 *
 * - 値はスペース区切りで複数指定可能
 * - 先頭に `-` を付けると、その識別子を除外する（例: `util="cbox -trim"`）
 * - 文字列配列も受け付けるが、これは内部 API 用途であり、
 *   ユーザー向けドキュメントでは紹介していない
 */
export type UtilPropValue = WithArbitraryString<UtilPreset> | WithArbitraryString<UtilPreset>[];
