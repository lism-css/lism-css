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

// color プロップは color（セマンティック）∪ palette（パレット）を受理する。
// 両者をマージしたフラットマップで color を上書きし、`-bgc:brand` も `-bgc:red` も同じカタログで受理する。
const tokensWithColor = {
  ...tokens,
  color: { ...tokens.color, ...tokens.palette },
} as const;

// tokens はフラット値マップ（{ key: value }）。arrayConvertToSet は配列のみ Set 化するため、
// トークンは実質ディープクローンされ、membership は `key in map`・型導出は `keyof` で行う。
export const TOKENS = arrayConvertToSet(structuredClone(tokensWithColor));
export const PROPS = arrayConvertToSet(structuredClone(props));

// TRAITS は objDeepMerge の型推論により literal types が保持される
export const TRAITS = traits;

// ブレイクポイント
//
// 配列記法 p={[base, sm, md, lg, xl]} は「何番目か」だけで対応する BP が決まる。
// この index → キーの並び順はユーザーの JSX が依存しているので、後から変えない。
// （順番を変えて index 1 が sm 以外になると、既存の p={[20, 40]} の意味が黙ってずれてしまう）
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'] as const; // index 1..4 のキー（base を除く）
export const BREAK_POINTS_ALL = ['base', ...BREAK_POINTS] as const; // index 0..4（base 込み）

// オブジェクト記法 p={{ base, xs, sm, ... }} で「BP 指定」とみなすキーの集合。
// xs は配列の index をずらさずには足せない（＝配列記法では書けない）ため、
// オブジェクト記法専用キーとしてここにだけ含める。
export const BREAK_POINTS_OBJ = ['base', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
