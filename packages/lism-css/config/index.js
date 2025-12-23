import defaultConfig from './default-config.ts';
import userConfig from 'lism-css/config.js'; // ユーザーが上書きできる
import { objDeepMerge, arrayConvertToSet } from './helper.js';

// ビルド時の設定をマージ
let mergedConfig = objDeepMerge(defaultConfig, userConfig);

// ブラウザ環境で window._LISM_CSS_CONFIG_ があればランタイムでマージ
if (typeof window !== 'undefined' && window._LISM_CSS_CONFIG_) {
	mergedConfig = objDeepMerge(mergedConfig, window._LISM_CSS_CONFIG_);
}

export const CONFIG = mergedConfig;

const { tokens, props, states } = CONFIG;

// 配列を Set化.
export const TOKENS = arrayConvertToSet(structuredClone(tokens));
export const PROPS = arrayConvertToSet(structuredClone(props));
export const STATES = states;

// ブレイクポイント
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'];
