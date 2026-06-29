/**
 * lism.config.js の `isFullMode: true`（full preset をコンポーネント側にも適用するモード）を
 * 型側へ反映するための拡張ポイント。
 *
 * full モードでは isVar 系を除く全 props が responsive になる（`props-full.ts` のランタイム挙動と一致）が、
 * 静的型は lism.config.js の `.js` の値を読めないため、デフォルトでは defaults 由来のまま追従しない。
 * このレジストリを `declare module 'lism-css'` で拡張（= 何らかのキーを1つ以上付与）すると、
 * {@link import('./PropValueTypes').PropValueTypes} が full 版に切り替わり、
 * `pl` 等の本来 bp:0 の props でも BP 指定（配列・オブジェクト記法）が型エラーにならなくなる。
 *
 * ランタイム側の有効化はあくまで lism.config.js の `isFullMode` で行う。ここで切り替えるのは
 * 「型が提示・許可する範囲」だけで、両者を一致させるのはユーザーの責務（`BreakpointRegistry` と同じ設計）。
 *
 * @example プロジェクト直下の型定義ファイル（例: `src/lism-env.d.ts`）で full モードを型に反映する
 * ```ts
 * import 'lism-css';
 *
 * declare module 'lism-css' {
 *   interface FullModeRegistry {
 *     enabled: true; // キー名は任意。1つでもキーがあれば full 版の型に切り替わる
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FullModeRegistry {}
