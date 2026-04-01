import defaultConfig from './default-config';
import userConfig from 'lism-css/config.js'; // ユーザーが上書きできる
import { objDeepMerge, arrayConvertToSet } from './helper';

interface Window {
  _LISM_CSS_CONFIG_: Partial<typeof defaultConfig>;
}
declare const window: Window;

// ビルド時の設定をマージ
let mergedConfig = objDeepMerge(defaultConfig, userConfig);

// ブラウザ環境で window._LISM_CSS_CONFIG_ があればランタイムでマージ
if (typeof window !== 'undefined' && window._LISM_CSS_CONFIG_) {
  mergedConfig = objDeepMerge(mergedConfig, window._LISM_CSS_CONFIG_);
}

export const CONFIG = mergedConfig;

const { tokens, props, states } = CONFIG;

const tokensWithColor = {
  color: [...tokens.c.values, ...tokens.palette.values],
  ...tokens,
} as const;

// 配列を Set化.
export const TOKENS = arrayConvertToSet(structuredClone(tokensWithColor));
export const PROPS = arrayConvertToSet(structuredClone(props));

// STATES は objDeepMerge の型推論により literal types が保持される
export const STATES = states;

// ブレイクポイント
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'] as const;
export const BREAK_POINTS_ALL = ['base', ...BREAK_POINTS] as const;
