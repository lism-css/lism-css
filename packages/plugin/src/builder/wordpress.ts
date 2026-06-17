/**
 * WordPress（`@wordpress/scripts`）用の統合エントリ（ロードマップ P2）。
 *
 * `@wordpress/scripts` は webpack 主導のため、Vite/Astro のような「bare CSS import をオンザフライで
 * 横取りする口」が無い。そこで Next.js 同様、config 反映済み CSS を `<root>/.lism-css/css/*` へ**事前生成**し、
 * `lism-css/<entry>.css` をその生成物へ `resolve.alias`（絶対パス）で差し替える方式を取る（中立コア
 * `generated-css` / `webpack-alias` を共有）。
 *
 * 想定する使い方（`webpack.config.js` 拡張スニペット）:
 * ```js
 * const { withLismWordPress } = require('@lism-css/plugin/wordpress');
 * module.exports = withLismWordPress(require('@wordpress/scripts/config/webpack.config'));
 * ```
 * webpack は `module.exports` が Promise でも受け付けるため、`withLismWordPress` は async（Promise を返す）でよい。
 *
 * 注入対象は ① `lism-css/<entry>.css` → 生成 CSS（`resolve.alias`、絶対パス）、② `lism-css/config.js$` →
 * user lism.config（完全一致 alias）、③ `lism-env.d.ts` 生成。さらに watch 追従のため webpack plugin を 1 つ足し、
 * (a) watch 再ビルド前に CSS + `lism-env.d.ts` を再生成、(b) `lism.config.js` を `fileDependencies` へ登録して
 * config 変更でも再ビルドが走るようにする。
 *
 * NOTE: webpack / `@wordpress/scripts` には依存しない。webpack config / compiler はジェネリック `T` や最小の
 * 構造的型で扱い、webpack 型を import しない。
 */
import path from 'node:path';

import { generateCssToDir } from './generated-css';
import { buildWebpackAlias } from './webpack-alias';
import { syncLismEnvDts } from './typegen';

export interface WithLismWordPressOptions {
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
  /** lism.config 探索の基点。既定は `process.cwd()`。 */
  projectRoot?: string;
  /** `lism-env.d.ts` 自動生成を行うか（既定: true）。 */
  typegen?: boolean;
  /** full.css / full_no_layer.css も生成するか（既定: false。purge 併用時に有効化）。 */
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
interface LismCssWordPressPluginOptions {
  projectRoot: string;
  outDir: string;
  configPath?: string;
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
 * - watchRun: 再ビルドのたびに CSS + `lism-env.d.ts` を再生成し、lism.config の変更を反映する。
 * - afterCompile: `lism.config.js` を `fileDependencies` へ登録し、config 変更でも再ビルドを発火させる。
 */
class LismCssWordPressPlugin {
  private readonly options: LismCssWordPressPluginOptions;

  constructor(options: LismCssWordPressPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const { projectRoot, outDir, configPath, typegen, full, userConfigPath } = this.options;

    // watch 再ビルドの直前に CSS / 型を再生成する（dev watch 時のみ発火するフック）。
    compiler.hooks.watchRun.tapPromise('LismCssWordPress', async () => {
      // bundler（webpack）側が最終 minify するため、ここでは minify せず生成する。
      // full は初回生成（withLismWordPress）と揃え、watch でも full.css を更新する。
      await generateCssToDir({ projectRoot, outDir, configPath, full, minify: false });
      if (typegen) await syncLismEnvDts(projectRoot, { configPath });
    });

    // lism.config.js を watch 依存へ登録し、config 変更でも再ビルドが走るようにする。
    compiler.hooks.afterCompile.tap('LismCssWordPress', (compilation) => {
      if (userConfigPath) compilation.fileDependencies.add(userConfigPath);
    });
  }
}

/**
 * `@wordpress/scripts` の webpack config を Lism CSS 対応へラップする。
 *
 * 既存 config を壊さない浅いクローンへ `resolve.alias`（CSS / config 差し替え）と watch 追従プラグインを
 * マージして返す。CSS 事前生成・typegen は非同期なので Promise を返す（webpack は Promise config を受け付ける）。
 */
export async function withLismWordPress<T extends Record<string, any>>(webpackConfig?: T, opts?: WithLismWordPressOptions): Promise<T> {
  const projectRoot = opts?.projectRoot ?? process.cwd();
  const outDir = path.join(projectRoot, '.lism-css/css');
  const typegen = opts?.typegen !== false;

  // bundler（webpack）側が最終 minify するため、ここでは minify せず生成する。
  const generated = await generateCssToDir({
    projectRoot,
    outDir,
    configPath: opts?.configPath,
    full: opts?.full ?? false,
    minify: false,
  });

  if (typegen) {
    await syncLismEnvDts(projectRoot, { configPath: opts?.configPath });
  }

  const alias = buildWebpackAlias({ generated, userConfigPath: generated.userConfigPath });

  const base = (webpackConfig ?? {}) as T;
  const existingResolve = base.resolve as WebpackConfig['resolve'] | undefined;
  const existingPlugins = base.plugins as unknown[] | undefined;
  const plugin = new LismCssWordPressPlugin({
    projectRoot,
    outDir,
    configPath: opts?.configPath,
    typegen,
    full: opts?.full ?? false,
    userConfigPath: generated.userConfigPath,
  });

  // 既存 config を壊さない浅いクローン。resolve.alias は既存を保持して lism の alias を上書き追加する。
  return {
    ...base,
    resolve: {
      ...existingResolve,
      alias: { ...existingResolve?.alias, ...alias },
    },
    plugins: [...(existingPlugins ?? []), plugin],
  } as T;
}

export default withLismWordPress;
