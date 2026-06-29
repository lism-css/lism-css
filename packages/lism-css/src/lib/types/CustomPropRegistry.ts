import type { Responsive } from './ResponsiveProps';

export type CustomPropValue = Responsive<(string & {}) | number | boolean | null | undefined>;

/**
 * lism.config.js で追加した prop キーを型側へ解禁するための拡張ポイント。
 *
 * プロジェクト直下の lism-env.d.ts から `declare module 'lism-css'` で拡張される。
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomPropRegistry {}
