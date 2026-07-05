/**
 * lism.config.js で既定 prop へ追加した値（presets / utils / token 由来）を型側へ広告するための拡張ポイント（#450）。
 *
 * キーは既定 prop 名、値は追加分の文字列リテラルユニオン。
 * プロジェクト直下の lism-env.d.ts から `declare module 'lism-css'` で拡張され、
 * PropValueTypes 側で defaults 由来の値ユニオンと `|` 合成される。
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomPropValueRegistry {}
