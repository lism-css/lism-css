import defaultConfig from './default-config';
import propsFull from './presets/props-full';
import userConfig from 'lism-css/config.js'; // ユーザーが上書きできる
import { objDeepMerge, arrayConvertToSet, foldTokenValues } from './helper';

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

// tokenValues チャンネル（#431）のキーをランタイム TOKENS にも登録し、`lts="2xl"` 等の props 受理を可能にする。
// CONFIG の静的型には tokenValues が無いため、参照のみキャストする（実体は userConfig 由来）。
const foldedTokens = foldTokenValues(
  tokens,
  (CONFIG as { tokenValues?: Record<string, Record<string, string | number>> }).tokenValues
) as typeof tokens;

const tokensWithColor = {
  color: [...foldedTokens.c.values, ...foldedTokens.palette.values],
  ...foldedTokens,
} as const;

// 配列を Set化.
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
