import PROPS from '../defaults/props';

type PropKey = keyof typeof PROPS;

// isVar 系（state 変数扱いの props）は BP 拡張の対象外。
// デフォルトで bp を持つもの（bdw, cols, rows）はデフォルト値のまま維持される。
type FullPropKey = { [K in PropKey]: (typeof PROPS)[K] extends { isVar: 1 } ? never : K }[PropKey];

/**
 * full.css 用の props オーバーライド設定（defaults/props.ts への差分のみ）。
 * isVar 系を除く全 props の BP サポートを有効化する（出力BPは $breakpoints の有効BPに従う）。
 *
 * キーを列挙せず defaults から導出しているのは、props 追加時に
 * このファイルの追従漏れで full.css から抜け落ちるのを防ぐため。
 * 個別に除外・上書きが必要になったら、導出後に上書きする形で追加する。
 */
const propsFull = Object.fromEntries(
  Object.entries(PROPS)
    .filter(([, config]) => !('isVar' in config && config.isVar === 1))
    .map(([key]) => [key, { bp: 1 }])
) as Record<FullPropKey, { bp: 1; tokenClass?: 1 }>;

// スペーシング系の方向指定 props（padding / margin / gap）にも space トークンの
// ユーティリティクラスを出力する（inset 系は position 用途のため対象外）。
const SPACING_DIRECTION_KEYS = [
  'ps',
  'pe',
  'pbs',
  'pbe',
  'pl',
  'pr',
  'pt',
  'pb',
  'ms',
  'me',
  'mbs',
  'mbe',
  'ml',
  'mr',
  'mt',
  'mb',
  'cg',
  'rg',
] as const;

for (const key of SPACING_DIRECTION_KEYS) {
  propsFull[key] = { ...propsFull[key], tokenClass: 1 };
}

export default propsFull;
