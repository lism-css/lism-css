import type { Responsive } from './ResponsiveProps';

/**
 * lism.config.js で追加した prop の値型。
 * `TValues` に utils / presets / token 由来の値リテラルを渡すと、既定 props と同様に
 * 値が補完されつつ任意文字列も受け付ける（#450）。未指定時は従来通りの緩い型。
 */
export type CustomPropValue<TValues extends string = never> = Responsive<TValues | (string & {}) | number | boolean | null | undefined>;

/**
 * lism.config.js で追加した prop キーを型側へ解禁するための拡張ポイント。
 *
 * プロジェクト直下の lism-env.d.ts から `declare module 'lism-css'` で拡張される。
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomPropRegistry {}
