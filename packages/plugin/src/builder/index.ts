/**
 * 「config → CSS」共有コア。bin CLI と Vite プラグインが共有する。
 *
 * - serialize: props 設定 → `$props` SCSS 文字列（純粋関数）
 * - compile: 同梱 src/scss の prop-config をディスク実ファイルとして読みつつ sass + postcss でコンパイル。
 *   ユーザー設定反映時は一時ディレクトリへ複製して prop-config を差し替え、node_modules を書き換えない。
 * - load-config: defaults / full preset / lism.config をマージして main / full の BuildConfig を作る。
 * - compile-entry: 単一エントリ → CSS 文字列のオンザフライ・コンパイラ（Vite プラグイン用）。
 */
export { serializePropConfig, serializeTokens, type BuildConfig, type PropConfig } from './serialize';
export {
  writePropConfigFiles,
  compileCssTree,
  buildCssToDir,
  type WritePropConfigOptions,
  type CompileTreeOptions,
  type BuildToDirOptions,
} from './compile';
export {
  computeBuildConfigs,
  loadBuildConfigs,
  findUserConfigPath,
  type LoadedBuildConfigs,
  type ComputeBuildConfigsInput,
  type LoadBuildConfigsOptions,
  type ObjDeepMerge,
} from './load-config';
export { createCssCompiler, listCssEntries, type CssCompiler, type CssCompilerOptions } from './compile-entry';
