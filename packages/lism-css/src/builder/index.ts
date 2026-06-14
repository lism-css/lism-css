/**
 * 「config → CSS」共有コア。bin CLI と Vite プラグインが共有する。
 *
 * - serialize: props 設定 → `$props` SCSS 文字列（純粋関数）
 * - compile: 同梱 src/scss の prop-config をディスク実ファイルとして読みつつ sass + postcss でコンパイル。
 *   ユーザー設定反映時は一時ディレクトリへ複製して prop-config を差し替え、node_modules を書き換えない。
 */
export { serializePropConfig, type BuildConfig, type PropConfig } from './serialize';
export {
  writePropConfigFiles,
  compileCssTree,
  buildCssToDir,
  type WritePropConfigOptions,
  type CompileTreeOptions,
  type BuildToDirOptions,
} from './compile';
