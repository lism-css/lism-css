/**
 * 「config → CSS」共有コア。bin CLI と Vite プラグインが共有する。
 *
 * - serialize: props 設定 → `$props` SCSS 文字列（純粋関数）
 * - compile: 同梱 src/scss の prop-config をディスク実ファイルとして読みつつ sass + postcss でコンパイル。
 *   ユーザー設定反映時は一時ディレクトリへ複製して prop-config を差し替え、node_modules を書き換えない。
 * - load-config: defaults / full preset / lism.config をマージして main / full の BuildConfig を作る。
 * - compile-entry: 単一エントリ → CSS 文字列のオンザフライ・コンパイラ（Vite プラグイン用）。
 * - generated-css: config 反映済み CSS を任意ディレクトリへ事前生成し、bare CSS import の alias map を返す（Next/webpack 用）。
 * - typegen: lism.config から `lism-env.d.ts` を生成 / 更新 / 削除する bundler 非依存コア。
 * - config-alias: `lism-css/config.js` を user config へ差し替えるための対象 id と解決 helper。
 * - scss-source: SCSS-source 消費者向けに config 反映済み setting の bridge SCSS を生成する（`@lism-css/plugin/webpack` の SCSS 版）。
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
export { generateCssToDir, type GenerateCssOptions, type GeneratedCss } from './generated-css';
export { writeLismEnvDts, syncLismEnvDts, TYPES_FILENAME, type SyncTypesOptions } from './typegen';
export { CONFIG_TARGET_ID, resolveConfigAliasPath } from './config-alias';
export { generateLismScss, type GenerateLismScssOptions, type GeneratedLismScss } from './scss-source';
