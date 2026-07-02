/**
 * ブレイクポイントのデフォルト定義
 *
 * 値 0 は「無効」を表し、`_query.scss` の bp-up / bp-down がクエリ出力をスキップする。
 * xs / xl をあらかじめキーとして並べておくことで、lism.config.js の `breakpoints` で
 * サイズを与えるだけ（差分上書き）で有効化でき、かつ正準順序（min-width カスケード順）を保つ。
 */
const BREAKPOINTS = {
  xs: 0,
  sm: '480px',
  md: '800px',
  lg: '1120px',
  xl: 0,
} as const;

export default BREAKPOINTS;

/** ブレイクポイントの全キー集合（`base` を除く）。config 執筆時の型・prop の bp リスト等の単一 source。 */
export type BreakpointKey = keyof typeof BREAKPOINTS;

// 配列記法 p={[base, sm, md, lg, xl]} は「何番目か」だけで対応する BP が決まる。
// この index → キーの並び順はユーザーの JSX が依存しているので、後から変えない。
// （順番を変えて index 1 が sm 以外になると、既存の p={[20, 40]} の意味が黙ってずれてしまう）
// xs は配列の index をずらさずには足せない（＝配列記法では書けない）ため、この並びには含めない。
// `satisfies` で各要素が BreakpointKey（全キー集合）に含まれることを型検査し、位置契約とのズレを検知する。
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'] as const satisfies readonly BreakpointKey[]; // index 1..4 のキー（base を除く）

/** 配列記法の位置順（`base` を除く）。位置は固定の契約（変更しない）。 */
export type BreakpointSequence = typeof BREAK_POINTS;

export const BREAK_POINTS_ALL = ['base', ...BREAK_POINTS] as const; // index 0..4（base 込み）

// オブジェクト記法 p={{ base, xs, sm, ... }} で「BP 指定」とみなすキーの集合。
// xs はオブジェクト記法専用キーとしてここにだけ含める。
export const BREAK_POINTS_OBJ = ['base', 'xs', ...BREAK_POINTS] as const;
