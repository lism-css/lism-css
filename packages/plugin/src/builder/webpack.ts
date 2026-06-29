/**
 * webpack 主導の bundler 向け汎用プリミティブ（`@lism-css/plugin/webpack`）。
 *
 * `@wordpress/scripts` をはじめとする webpack ベースのビルドには、Vite/Astro のような「bare CSS import を
 * オンザフライで横取りする口」が無い。そこで（必要なら）config 反映済み CSS を `<root>/.lism-css/css/*` へ
 * **事前生成**して `lism-css/<entry>.css` を `resolve.alias`（絶対パス）で差し替え、`lism-css/config.js` を
 * user lism.config へ alias する。これらはすべて webpack の仕組みであり WP 固有ロジックは無いため、
 * bundler プリミティブとして一般化する。WP/テーマ固有のロジック（externals 等）は消費側の責務とし、ここには入れない。
 *
 * 想定する使い方（`webpack.config.js`(CJS) 拡張スニペット）:
 * ```js
 * const { withLismWebpack } = require('@lism-css/plugin/webpack');
 * module.exports = withLismWebpack(require('@wordpress/scripts/config/webpack.config'), { css: true });
 * ```
 * webpack は `module.exports` が Promise でも受け付けるため、`withLismWebpack` は async（Promise を返す）でよい。
 *
 * オプションで挙動を切り替える:
 * - `css`（既定 false）: `lism-css/<entry>.css` → 生成 CSS の alias（CSS を事前生成する）。SCSS-source 消費者は false。
 * - `config`（既定 true）: `lism-css/config.js$` → user lism.config の alias（完全一致）。
 * - `typegen`（既定 false）: `lism-env.d.ts` 生成。
 * - `watch`（既定 true）: watchRun での再生成 + `lism.config.js` を `fileDependencies` へ登録。
 *
 * SCSS-source 消費者向けの bridge SCSS 生成（`generateLismScss`）は webpack 評価とタイミングが異なるため、
 * `withLismWebpack` には含めず builder の独立 export とする。
 *
 * NOTE: webpack / `@wordpress/scripts` には依存しない。webpack config / compiler はジェネリック `T` や最小の
 * 構造的型で扱い、webpack 型を import しない。
 */
import path from 'node:path';

import { CONFIG_TARGET_ID } from './config-alias';
import { generateCssToDir, type GeneratedCss } from './generated-css';
import { findUserConfigPath } from './load-config';
import { syncLismEnvDts } from './typegen';

export interface WithLismWebpackOptions {
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
  /** lism.config 探索の基点。既定は `process.cwd()`。 */
  projectRoot?: string;
  /** `lism-css/<entry>.css` → 生成 CSS の alias を張る（CSS を事前生成する）。既定: false。SCSS-source は false。 */
  css?: boolean;
  /** `lism-css/config.js$` → user lism.config の alias を張る。既定: true。 */
  config?: boolean;
  /** `lism-env.d.ts` 自動生成を行うか。既定: false。 */
  typegen?: boolean;
  /** watchRun での再生成 + `lism.config.js` を `fileDependencies` へ登録するか。既定: true。 */
  watch?: boolean;
  /** full.css / full_no_layer.css も生成するか（`css: true` 時のみ有効。既定: false。purge 併用時に有効化）。 */
  full?: boolean;
}

/** webpack config の最小構造（webpack 非依存。実際の型は `T` 側に従う）。 */
interface WebpackConfig {
  resolve?: { alias?: Record<string, unknown>; [key: string]: unknown };
  plugins?: unknown[];
  [key: string]: unknown;
}

/** tapable hook の最小構造（compiler.hooks を webpack 型 import 無しで扱う）。 */
interface Compiler {
  hooks: {
    watchRun: { tapPromise(name: string, fn: () => Promise<void>): void };
    afterCompile: { tap(name: string, fn: (compilation: { fileDependencies: Set<string> }) => void): void };
  };
}

/** プラグインへ渡す設定（保持して watch / afterCompile で使う）。 */
interface LismCssWebpackPluginOptions {
  projectRoot: string;
  /** 生成 CSS の出力先（`css: true` 時のみ。false の場合は null）。 */
  outDir: string | null;
  configPath?: string;
  /** CSS 事前生成を行うか（watchRun での再生成可否を分岐する）。 */
  css: boolean;
  typegen: boolean;
  /** full.css / full_no_layer.css も生成するか（初回生成と揃える）。 */
  full: boolean;
  /** watch 依存へ登録する user lism.config の絶対パス（無ければ null）。 */
  userConfigPath: string | null;
}

/**
 * watch 追従用の webpack plugin。
 *
 * webpack 型は import せず、`apply(compiler)` の compiler / compilation を最小の構造的型で扱う。
 * - watchRun: `css` / `typegen` が有効な時だけ CSS / `lism-env.d.ts` を再生成する（`css: false` では CSS を再生成しない）。
 * - afterCompile: `lism.config.js` を `fileDependencies` へ登録し、config 変更でも再ビルドを発火させる。
 */
class LismCssWebpackPlugin {
  private readonly options: LismCssWebpackPluginOptions;

  constructor(options: LismCssWebpackPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const { projectRoot, outDir, configPath, css, typegen, full, userConfigPath } = this.options;

    // watch 再ビルドの直前に CSS / 型を再生成する（dev watch 時のみ発火するフック）。
    // css / typegen のいずれも無効なら再生成すべきものが無いため tap しない。
    if (css || typegen) {
      compiler.hooks.watchRun.tapPromise('LismCssWebpack', async () => {
        // bundler（webpack）側が最終 minify するため、ここでは minify せず生成する。
        // css: false では CSS を再生成しない（ゴミ CSS / 無駄ビルドの防止）。
        if (css && outDir) await generateCssToDir({ projectRoot, outDir, configPath, full, minify: false });
        if (typegen) await syncLismEnvDts(projectRoot, { configPath });
      });
    }

    // lism.config.js を watch 依存へ登録し、config 変更でも再ビルドが走るようにする（css の有無に依らず維持）。
    if (userConfigPath) {
      compiler.hooks.afterCompile.tap('LismCssWebpack', (compilation) => {
        compilation.fileDependencies.add(userConfigPath);
      });
    }
  }
}

/**
 * webpack config を Lism CSS 対応へラップする汎用プリミティブ。
 *
 * 既存 config を壊さない浅いクローンへ `resolve.alias`（CSS / config 差し替え）と watch 追従プラグインを
 * マージして返す。CSS 事前生成・typegen は非同期なので Promise を返す（webpack は Promise config を受け付ける）。
 */
export async function withLismWebpack<T extends Record<string, any>>(webpackConfig?: T, opts?: WithLismWebpackOptions): Promise<T> {
  const projectRoot = opts?.projectRoot ?? process.cwd();
  const css = opts?.css ?? false;
  const configAlias = opts?.config ?? true;
  const typegen = opts?.typegen ?? false;
  const watch = opts?.watch ?? true;
  const full = opts?.full ?? false;
  const outDir = css ? path.join(projectRoot, '.lism-css/css') : null;

  // css: true の時だけ CSS を事前生成する（`.lism-css/css` を作らない / CSS alias を張らない no-op を死守）。
  let generated: GeneratedCss | null = null;
  if (css && outDir) {
    // bundler（webpack）側が最終 minify するため、ここでは minify せず生成する。
    generated = await generateCssToDir({ projectRoot, outDir, configPath: opts?.configPath, full, minify: false });
  }

  if (typegen) {
    await syncLismEnvDts(projectRoot, { configPath: opts?.configPath });
  }

  // CSS 生成済みならその userConfigPath を流用し、未生成なら独立して探索する。
  const userConfigPath = generated ? generated.userConfigPath : findUserConfigPath(projectRoot, opts?.configPath);

  // alias は css / config の各トグルに応じて個別に組む。
  const alias: Record<string, string> = {};
  if (css && generated) Object.assign(alias, generated.aliasMap);
  if (configAlias && userConfigPath) alias[`${CONFIG_TARGET_ID}$`] = userConfigPath;

  const base = (webpackConfig ?? {}) as T;
  const existingResolve = base.resolve as WebpackConfig['resolve'] | undefined;
  const existingPlugins = base.plugins as unknown[] | undefined;

  const plugins = [...(existingPlugins ?? [])];
  if (watch) {
    plugins.push(
      new LismCssWebpackPlugin({
        projectRoot,
        outDir,
        configPath: opts?.configPath,
        css,
        typegen,
        full,
        userConfigPath,
      })
    );
  }

  // 既存 config を壊さない浅いクローン。resolve.alias / plugins は既存を保持して lism の追加分を上書き追記する。
  return {
    ...base,
    resolve: {
      ...existingResolve,
      alias: { ...existingResolve?.alias, ...alias },
    },
    plugins,
  } as T;
}

export default withLismWebpack;
