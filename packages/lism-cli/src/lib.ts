/**
 * `@lism-css/cli` の公開 API。
 * `create-lism` 等の外部ラッパーから利用するための関数 export のみを置く。
 */
export { runCreate } from './commands/create.js';
export type { RunCreateArgs } from './commands/create.js';
export { setLang, t, tOf } from './i18n.js';
export type { Lang } from './i18n.js';
