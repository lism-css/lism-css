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
