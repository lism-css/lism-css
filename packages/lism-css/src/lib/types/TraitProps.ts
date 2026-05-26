import type { TRAITS } from '../../../config/index';
import type { PropValueTypes } from './PropValueTypes';
import type { WithArbitraryString } from './utils';

/**
 * config/index.ts から TRAITS の型を取得
 * objDeepMerge の DeepMergeResult 型により literal types が保持される
 */
type TraitsConfig = typeof TRAITS;

// ============================================================
// Trait 設定のパターン
// ============================================================
//
// 文字列形式 (SimpleTrait)
// 例: isContainer: 'is--container'
// → boolean のみ受け付ける（true/false でクラスの付与を制御）
//
// isWrapper は現行仕様として、boolean に加えて contentSize 相当の文字列値も受け付ける。
//
// ============================================================

/**
 * Trait 設定から Props の値の型を抽出するユーティリティ型
 */
type ExtractTraitValue<T> = T extends string ? boolean : never;

type GeneratedTraitProps = {
  [K in keyof TraitsConfig]?: ExtractTraitValue<TraitsConfig[K]>;
};

type ContentSizeStringValue = Extract<NonNullable<PropValueTypes['contentSize']>, string>;

/**
 * config/index.ts の TRAITS から自動生成される Trait Props の型
 * config/index.ts の TRAITS に新しいトレイトを追加すると自動的に反映される
 */
export type TraitProps = Omit<GeneratedTraitProps, 'isWrapper'> & {
  isWrapper?: boolean | ContentSizeStringValue;
};

/** set prop で使われるプリセット値（エディタ補完用） */
type SetPreset = 'plain' | 'revert' | 'hov' | 'bxsh' | 'bdrsInner' | 'bleed' | 's';

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
type UtilPreset = 'cbox' | 'trim' | 'trimAll' | 'srOnly' | 'clipText' | 'divide' | 'cells';

/**
 * util prop の値の型。既知の `u--` クラス名がサジェストされつつ、任意の文字列も受け付ける。
 *
 * - 値はスペース区切りで複数指定可能
 * - 先頭に `-` を付けると、その識別子を除外する（例: `util="cbox -trim"`）
 * - 文字列配列も受け付けるが、これは内部 API 用途であり、
 *   ユーザー向けドキュメントでは紹介していない
 */
export type UtilPropValue = WithArbitraryString<UtilPreset> | WithArbitraryString<UtilPreset>[];
