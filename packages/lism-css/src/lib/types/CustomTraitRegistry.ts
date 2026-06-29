/**
 * lism.config.js の traits で追加した trait キーを型側へ解禁するための拡張ポイント。
 *
 * プロジェクト直下の lism-env.d.ts から `declare module 'lism-css'` で拡張される。
 * trait は presence ベース（真偽でクラス付与を制御）なので値は boolean（既定 trait の `ExtractTraitValue<string>` に一致）。
 */
export type CustomTraitValue = boolean;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomTraitRegistry {}
