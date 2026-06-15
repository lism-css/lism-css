/**
 * 「config 読み込み」の共有ロジック。bin CLI と Vite プラグインが共有する。
 *
 * - `computeBuildConfigs`: defaults / full preset / full CSS defaults / userConfig をマージして main / full の BuildConfig を作る純粋関数。
 *   マージ順（later wins）は `config/index.ts`・`bin/cli.mjs` と一致させる（JS ランタイムと CSS 出力の乖離防止）。
 * - `loadBuildConfigs`: default-config / props-full preset / helper を **ビルド済み dist 成果物**から dynamic import し、
 *   projectRoot の `lism.config.{js,mjs}` を読み込んでマージする。consumer 環境（インストール済みパッケージ）で実行される前提。
 *   user 設定は mtime をクエリに付けて import し、dev での `lism.config.js` 変更を ESM モジュールキャッシュ越しに拾えるようにする。
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { distDir as packageDistDir } from './paths';
import type { BuildConfig, PropConfig } from './serialize';

export type ObjDeepMerge = (origin: Record<string, unknown>, source: Record<string, unknown>) => Record<string, unknown>;

const USER_CONFIG_SEARCH = ['lism.config.js', 'lism.config.mjs'];
const FULL_CSS_DEFAULTS = {
  // full.css は purge 併用前提のスーパーセットとして xs を有効化する。
  // userConfig はこの後にマージするため、lism.config.js の breakpoints.xs が最後に勝つ。
  breakpoints: { xs: '360px' },
} satisfies Record<string, unknown>;

export interface LoadedBuildConfigs {
  /** main 系（main.css / 個別レイヤ）が読む prop-config の元 CONFIG。isFullMode 時は fullConfig と同一。 */
  mainConfig: BuildConfig;
  /** full 系（full.css / full_no_layer.css）が読む prop-config の元 CONFIG。 */
  fullConfig: BuildConfig;
  /** default-config に最初から含まれる prop キー。typegen で追加 prop との差分抽出に使う。 */
  defaultPropKeys: string[];
  /** lism.config.js の isFullMode フラグ。 */
  isFullMode: boolean;
  /** 見つかった user 設定ファイルの絶対パス（無ければ null）。watch 対象に使う。 */
  userConfigPath: string | null;
}

/** 明示パス、または projectRoot 直下の lism.config.{js,mjs} を探す。 */
export function findUserConfigPath(projectRoot: string, configPath?: string): string | null {
  if (configPath) {
    const abs = path.resolve(projectRoot, configPath);
    return fs.existsSync(abs) ? abs : null;
  }

  for (const name of USER_CONFIG_SEARCH) {
    const abs = path.resolve(projectRoot, name);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

export interface ComputeBuildConfigsInput {
  defaultConfig: BuildConfig;
  propsFull: Record<string, PropConfig>;
  userConfig: Record<string, unknown>;
  objDeepMerge: ObjDeepMerge;
}

/**
 * defaults / full preset / userConfig から main / full の BuildConfig を作る純粋関数。
 *
 * マージ順（later wins）:
 *   - fullConfig: defaults → full preset → full CSS defaults → userConfig
 *   - mainConfig: isFullMode 時は fullConfig と同一、それ以外は defaults → userConfig
 *
 * これは `config/index.ts`（コンポーネント側）・`bin/cli.mjs`（CLI）と同じ順序。
 */
export function computeBuildConfigs({ defaultConfig, propsFull, userConfig, objDeepMerge }: ComputeBuildConfigsInput): {
  mainConfig: BuildConfig;
  fullConfig: BuildConfig;
  isFullMode: boolean;
} {
  const isFullMode = !!(userConfig as { isFullMode?: boolean }).isFullMode;

  const base = defaultConfig as unknown as Record<string, unknown>;
  const fullBase = objDeepMerge(objDeepMerge(base, { props: propsFull }), FULL_CSS_DEFAULTS);
  const fullConfig = objDeepMerge(fullBase, userConfig) as unknown as BuildConfig;
  const mainConfig = isFullMode ? fullConfig : (objDeepMerge(base, userConfig) as unknown as BuildConfig);

  return { mainConfig, fullConfig, isFullMode };
}

export interface LoadBuildConfigsOptions {
  /** dist 成果物のルート（既定: 本ファイルの 1 つ上 = dist/）。tsx/vitest など source 実行では明示する。 */
  distDir?: string;
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
}

/**
 * projectRoot の lism.config を反映した main / full の BuildConfig を読み込む。
 */
export async function loadBuildConfigs(projectRoot: string, opts: LoadBuildConfigsOptions = {}): Promise<LoadedBuildConfigs> {
  const distDir = opts.distDir ?? packageDistDir;
  // dynamic import の戻り値は any のため、ここで明示的に unknown へ落として型安全に扱う。
  const importDist = (rel: string): Promise<unknown> => import(pathToFileURL(path.join(distDir, rel)).href);

  const [defaultMod, propsFullMod, helperMod] = (await Promise.all([
    importDist('config/default-config.js'),
    importDist('config/presets/props-full.js'),
    importDist('config/helper.js'),
  ])) as [{ default?: BuildConfig }, { default?: Record<string, PropConfig> }, { objDeepMerge?: ObjDeepMerge }];

  const defaultConfig = defaultMod.default;
  const propsFull = propsFullMod.default;
  const objDeepMerge = helperMod.objDeepMerge;
  if (!defaultConfig || !propsFull || !objDeepMerge) {
    // 空のまま進めると「full ではない full.css」が黙って生成されるため、明示的にエラーにする。
    throw new Error(`[lism-css] config 成果物の読み込みに失敗しました（dist: ${distDir}）。lism-css のビルドが必要です。`);
  }

  const userConfigPath = findUserConfigPath(projectRoot, opts.configPath);
  let userConfig: Record<string, unknown> = {};
  if (userConfigPath) {
    // mtime をクエリに付けて ESM モジュールキャッシュをバストする（dev で lism.config.js 変更を拾うため）。
    const mtime = fs.statSync(userConfigPath).mtimeMs;
    const userMod = (await import(`${pathToFileURL(userConfigPath).href}?v=${mtime}`)) as { default?: Record<string, unknown> };
    userConfig = userMod.default ?? {};
  }

  const { mainConfig, fullConfig, isFullMode } = computeBuildConfigs({ defaultConfig, propsFull, userConfig, objDeepMerge });
  return { mainConfig, fullConfig, defaultPropKeys: Object.keys(defaultConfig.props), isFullMode, userConfigPath };
}
