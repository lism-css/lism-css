import defaultConfig from './default-config.js';
import userConfig from 'lism-css/config.js'; // ユーザーが上書きできる
import { objDeepMerge, arrayConvertToSet } from './helper.js';

export const CONFIG = objDeepMerge(defaultConfig, userConfig);

const { tokens, props, states } = CONFIG;

// 配列を Set化.
export const TOKENS = arrayConvertToSet(structuredClone(tokens));
export const PROPS = arrayConvertToSet(structuredClone(props));
export const STATES = states;

// ブレイクポイント
export const BREAK_POINTS = ['sm', 'md', 'lg', 'xl'];
