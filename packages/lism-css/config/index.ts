import defaultConfig from './default-config';
import userConfig from 'lism-css/config.js'; // ユーザーが上書きできる
import { objDeepMerge, arrayConvertToSet } from './helper';

interface Window {
	_LISM_CSS_CONFIG_: Partial<typeof defaultConfig>;
}
declare const window: Window;

// ビルド時の設定をマージ
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unnecessary-type-assertion
let mergedConfig = objDeepMerge(defaultConfig, userConfig as {});

// ブラウザ環境で window._LISM_CSS_CONFIG_ があればランタイムでマージ
if (typeof window !== 'undefined' && window._LISM_CSS_CONFIG_) {
	mergedConfig = objDeepMerge(mergedConfig, window._LISM_CSS_CONFIG_);
}

export const CONFIG = mergedConfig;

const { tokens, props, states } = CONFIG;

// 配列を Set化.
export const TOKENS = arrayConvertToSet(structuredClone(tokens));
export const PROPS = arrayConvertToSet(structuredClone(props));

// STATES は objDeepMerge の型推論により literal types が保持される
export const STATES = states;

// ブレイクポイント
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'] as const;
