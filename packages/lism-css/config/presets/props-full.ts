import PROPS from '../defaults/props';

type PropKey = keyof typeof PROPS;

// border ショートハンド系（bd + 方向指定）は BP 拡張の対象外。
// _border.scss が --bds / --bdw / --bdc の3変数で管理する特殊実装を持ち、bp:1 が出力する
// 汎用ベースルール（.-bd { border: var(--bd) } 等）とカスケードで競合するため（#513）。
// border の BP 対応はサブプロパティ（bds / bdw / bdc）で行う。
export const FULL_BP_EXCLUDED_KEYS = ['bd', 'bd-x', 'bd-y', 'bd-s', 'bd-e', 'bd-bs', 'bd-be', 'bd-t', 'bd-b', 'bd-l', 'bd-r'] as const;

// isVar 系のうち、full 限定で BP サポートを追加するキー（border サブプロパティ）。
// bdw は defaults で bp:1 対応済み。isVar 系の BP クラスは
// `.-bds_sm { --bds: var(--bds_sm) !important }` のように変数を上書きするだけなので競合しない。
export const FULL_BP_ISVAR_KEYS = ['bds', 'bdc'] as const;

export type FullBpExcludedKey = (typeof FULL_BP_EXCLUDED_KEYS)[number];
export type FullBpIsVarKey = (typeof FULL_BP_ISVAR_KEYS)[number];

// isVar 系（state 変数扱いの props）は BP 拡張の対象外。
// デフォルトで bp を持つもの（bdw, cols, rows）はデフォルト値のまま維持される。
type NonVarPropKey = { [K in PropKey]: (typeof PROPS)[K] extends { isVar: 1 } ? never : K }[PropKey];
type FullPropKey = Exclude<NonVarPropKey, FullBpExcludedKey> | FullBpIsVarKey;

/**
 * full.css 用の props オーバーライド設定（defaults/props.ts への差分のみ）。
 * isVar 系・border ショートハンド系を除く全 props の BP サポートを有効化する
 * （出力BPは $breakpoints の有効BPに従う）。ただし isVar 系のうち
 * border サブプロパティ（FULL_BP_ISVAR_KEYS）のみ例外として、導出後に個別で BP サポートを追加する。
 *
 * キーを列挙せず defaults から導出しているのは、props 追加時に
 * このファイルの追従漏れで full.css から抜け落ちるのを防ぐため。
 * 個別に除外・上書きが必要になったら、導出後に上書きする形で追加する。
 */
const propsFull = Object.fromEntries(
  Object.entries(PROPS)
    .filter(([key, config]) => !('isVar' in config && config.isVar === 1) && !(FULL_BP_EXCLUDED_KEYS as readonly string[]).includes(key))
    .map(([key]) => [key, { bp: 1 }])
) as Record<FullPropKey, { bp: 1 }>;

// border サブプロパティ（isVar 系）は導出フィルタの対象外のため、個別に BP サポートを追加する。
for (const key of FULL_BP_ISVAR_KEYS) {
  propsFull[key] = { bp: 1 };
}

// スペーシング系の方向指定 props（padding / margin / gap）の space トークンユーティリティクラスは
// defaults 側で tokenClass:1 になったため、ここでの上書きは不要。

export default propsFull;
