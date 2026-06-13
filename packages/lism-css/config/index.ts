import defaultConfig from './default-config';
import propsFull from './presets/props-full';
import userConfig from 'lism-css/config.js'; // ユーザーが上書きできる
import { objDeepMerge, arrayConvertToSet } from './helper';

interface Window {
  _LISM_CSS_CONFIG_: Partial<typeof defaultConfig>;
}
declare const window: Window;

// isFullMode: full.css の読み込みを前提に、コンポーネント側の props 設定にも full preset を適用するモード。
// 注: 静的型は defaults のまま維持する（lism.config.js での props 上書きと同じ制限。型レベルの full 対応は別途検討）。
const isFullMode = (userConfig as { isFullMode?: boolean }).isFullMode;
const baseConfig = isFullMode ? (objDeepMerge(defaultConfig, { props: propsFull }) as unknown as typeof defaultConfig) : defaultConfig;

// ビルド時の設定をマージ。(later wins): defaults → full preset → lism.config.js
let mergedConfig = objDeepMerge(baseConfig, userConfig);

// ブラウザ環境で window._LISM_CSS_CONFIG_ があればランタイムでマージ
if (typeof window !== 'undefined' && window._LISM_CSS_CONFIG_) {
  mergedConfig = objDeepMerge(mergedConfig, window._LISM_CSS_CONFIG_);
}

export const CONFIG = mergedConfig;

const { tokens, props, traits } = CONFIG;

const tokensWithColor = {
  color: [...tokens.c.values, ...tokens.palette.values],
  ...tokens,
} as const;

// 配列を Set化.
export const TOKENS = arrayConvertToSet(structuredClone(tokensWithColor));
export const PROPS = arrayConvertToSet(structuredClone(props));

// TRAITS は objDeepMerge の型推論により literal types が保持される
export const TRAITS = traits;

// ブレイクポイント
// BREAK_POINTS / BREAK_POINTS_ALL は「配列記法のインデックス→キー対応」を表す固定の契約（変更しない）。
// 位置は base=0, sm=1, md=2, lg=3, xl=4 で固定し、xs は配列記法では書けない（後述の OBJ 側のみ）。
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'] as const;
export const BREAK_POINTS_ALL = ['base', ...BREAK_POINTS] as const;

// オブジェクト記法（{ base, xs, sm, ... }）で BP 指定とみなすキーの集合。
// 配列記法には無い xs を含む（xs はオブジェクト記法でのみ指定可能）。
export const BREAK_POINTS_OBJ = ['base', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
