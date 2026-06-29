/**
 * Next.js（16 以降）用の統合エントリ（ロードマップ P1）。
 *
 * Next.js には Vite/Astro のような「bare CSS import をオンザフライで横取りする口」が無いため、
 * config 反映済み CSS を `<root>/.lism-css/css/*` へ**事前生成**し、`lism-css/<entry>.css` をその生成物へ
 * alias で差し替える方式を取る（中立コア `generated-css` / `webpack-alias` を共有）。
 *
 * Next.js 16 は Turbopack 主導のため、`turbopack.resolveAlias` へ alias を注入するのが基本経路。
 * ただし Turbopack の `resolveAlias` は**絶対パスを渡すと解決に失敗**するため project-relative パスを使い、
 * `next dev --webpack` / `next build --webpack` の fallback 用に webpack `resolve.alias` へは**絶対パス**で
 * 同等 alias を注入する（P0.5 spike で確定した使い分け）。
 *
 * 注入対象は ① `lism-css/<entry>.css` → 生成 CSS、② `lism-css/config.js` → user lism.config の 2 系統 +
 * ③ `lism-env.d.ts` 生成。CSS 事前生成・typegen はいずれも非同期なので、Next が受け付ける
 * 「`(phase, ctx) => config | Promise<config>`」形式の **async config 関数**を返す設計にする。
 *
 * Next dev には Vite/Astro の watch API や webpack compiler hook 相当の汎用注入口が無いため、dev 中の
 * `lism.config.js` 変更追従は `watchLismConfig`（`fs.watch` ベース）が担う。dev フェーズで起動し、config 変更時に
 * CSS / 型を再生成する。生成 CSS の変更は Turbopack（および `--webpack` dev の webpack）が拾うため、再起動なしで反映される。
 */
import path from 'node:path';

import { generateCssToDir } from './generated-css';
import { buildWebpackAlias, buildTurbopackAlias } from './webpack-alias';
import { syncLismEnvDts } from './typegen';
import { watchLismConfig } from './config-watcher';

/** Next.js の dev サーバーフェーズ識別子（`next/constants` の PHASE_DEVELOPMENT_SERVER。next 非依存にするため直書き）。 */
const PHASE_DEVELOPMENT_SERVER = 'phase-development-server';

// 同一 config を二重監視しないためのガード（config 関数が複数回呼ばれても watcher は 1 つに保つ）。
// dev サーバーのライフタイム中は閉じない（プロセス終了で watcher も消える。FSWatcher は unref 済み）。
const watchedConfigs = new Set<string>();

export interface WithLismOptions {
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
  /** lism.config 探索の基点。既定は `process.cwd()`。 */
  projectRoot?: string;
  /** `lism-env.d.ts` 自動生成を行うか（既定: true）。 */
  typegen?: boolean;
  /** full.css / full_no_layer.css も生成するか（既定: false。purge 併用時に有効化）。 */
  full?: boolean;
}

/** Turbopack 設定の最小構造（next 非依存。実際の型は `T` 側に従う）。 */
interface TurbopackConfig {
  resolveAlias?: Record<string, string>;
  [key: string]: unknown;
}

/** webpack カスタマイズ関数の最小構造（next/webpack 非依存）。 */
type WebpackConfig = { resolve?: { alias?: Record<string, unknown>; [key: string]: unknown }; [key: string]: unknown };
type WebpackFn = (config: WebpackConfig, options: unknown) => WebpackConfig;

/**
 * Next.js の config を Lism CSS 対応へラップする。
 *
 * `export default withLism(nextConfig, opts)` のように next.config の default export へ渡す。
 * 返り値は async config 関数で、Next がそれを解決する際に CSS 事前生成 / typegen / alias 注入を行う。
 */
export function withLism<T extends Record<string, any>>(nextConfig?: T, opts?: WithLismOptions): (phase: string, ctx?: unknown) => Promise<T> {
  return async (phase?: string): Promise<T> => {
    const projectRoot = opts?.projectRoot ?? process.cwd();
    const outDir = path.join(projectRoot, '.lism-css/css');

    // bundler（Turbopack / webpack）側が最終 minify するため、ここでは minify せず生成する。
    const generated = await generateCssToDir({
      projectRoot,
      outDir,
      configPath: opts?.configPath,
      full: opts?.full ?? false,
      minify: false,
    });

    if (opts?.typegen !== false) {
      await syncLismEnvDts(projectRoot, { configPath: opts?.configPath });
    }

    // dev フェーズかつ user lism.config がある場合のみ、変更追従の watcher を 1 つ起動する。
    // 起動時生成（上）に加え、dev 中の保存でも CSS / 型を再生成して Turbopack に反映させる。
    if (phase === PHASE_DEVELOPMENT_SERVER && generated.userConfigPath && !watchedConfigs.has(generated.userConfigPath)) {
      const userConfigPath = generated.userConfigPath;
      watchedConfigs.add(userConfigPath);
      watchLismConfig({
        configPath: userConfigPath,
        onChange: async () => {
          await generateCssToDir({ projectRoot, outDir, configPath: opts?.configPath, full: opts?.full ?? false, minify: false });
          if (opts?.typegen !== false) await syncLismEnvDts(projectRoot, { configPath: opts?.configPath });
        },
      });
    }

    // Turbopack は project-relative、webpack は絶対パス（spike で確定した使い分け）。
    const turboAlias = buildTurbopackAlias({ generated, userConfigPath: generated.userConfigPath }, projectRoot);
    const wpAlias = buildWebpackAlias({ generated, userConfigPath: generated.userConfigPath });

    const base = (nextConfig ?? {}) as T;
    const existingTurbopack = base.turbopack as TurbopackConfig | undefined;
    const userWebpack = base.webpack as WebpackFn | undefined;

    // 既存 nextConfig を壊さない浅いクローンへ alias をマージして返す。
    return {
      ...base,
      turbopack: {
        ...existingTurbopack,
        // 既存 resolveAlias は保持し、lism の alias を上書き追加する。
        resolveAlias: { ...existingTurbopack?.resolveAlias, ...turboAlias },
      },
      // 既存 webpack カスタマイズがあれば compose（先に user 関数を通してから alias を足す）。
      webpack: (config: WebpackConfig, options: unknown): WebpackConfig => {
        const c = userWebpack ? userWebpack(config, options) : config;
        c.resolve = c.resolve ?? {};
        c.resolve.alias = { ...c.resolve.alias, ...wpAlias };
        return c;
      },
    } as T;
  };
}

export default withLism;
