import type { TRAITS } from '../../../config/index';
import type { PropValueTypes } from './PropValueTypes';
import type { WithArbitraryString } from './utils';

type TraitsConfig = typeof TRAITS;

// isWrapper は現行仕様として、boolean に加えて contentSize 相当の文字列値も受け付ける。
// hasTransition は boolean に加えて、--transitionProps に出力する文字列（例: 'color, opacity'）も受け付ける。
type ExtractTraitValue<T> = T extends string ? boolean : never;

type GeneratedTraitProps = {
  [K in keyof TraitsConfig]?: ExtractTraitValue<TraitsConfig[K]>;
};

type ContentSizeStringValue = Extract<NonNullable<PropValueTypes['contentSize']>, string>;

/** config/index.tsのTRAITSへの追加を自動反映する。 */
export type TraitProps = Omit<GeneratedTraitProps, 'isWrapper' | 'hasTransition'> & {
  isWrapper?: boolean | ContentSizeStringValue;
  hasTransition?: boolean | string;
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
type UtilPreset = 'cbox' | 'trim' | 'trimAll' | 'srOnly' | 'clipText' | 'divide' | 'enclose';

/**
 * util prop の値の型。既知の `u--` クラス名がサジェストされつつ、任意の文字列も受け付ける。
 *
 * - 値はスペース区切りで複数指定可能
 * - 先頭に `-` を付けると、その識別子を除外する（例: `util="cbox -trim"`）
 * - 文字列配列も受け付けるが、これは内部 API 用途であり、
 *   ユーザー向けドキュメントでは紹介していない
 */
export type UtilPropValue = WithArbitraryString<UtilPreset> | WithArbitraryString<UtilPreset>[];
