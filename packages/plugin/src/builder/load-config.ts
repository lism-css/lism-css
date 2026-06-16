/**
 * 「config 読み込み」の共有ロジック。bin CLI と Vite プラグインが共有する。
 *
 * - `computeBuildConfigs`: defaults / full preset / full CSS defaults / userConfig をマージして main / full の BuildConfig を作る純粋関数。
 *   マージ順（later wins）は `config/index.ts`・`bin/cli.mjs` と一致させる（JS ランタイムと CSS 出力の乖離防止）。
 * - `loadBuildConfigs`: lism-css の default-config / props-full preset / helper と
 *   projectRoot の `lism.config.{js,mjs}` を読み込んでマージする。consumer 環境（インストール済みパッケージ）で実行される前提。
 *   user 設定は mtime をクエリに付けて import し、dev での `lism.config.js` 変更を ESM モジュールキャッシュ越しに拾えるようにする。
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import defaultConfig from 'lism-css/default-config';
import propsFull from 'lism-css/config/presets/props-full';
import { objDeepMerge } from 'lism-css/config/helper';
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
  /** default-config に最初から含まれる trait キー。typegen で追加 trait との差分抽出に使う。 */
  defaultTraitKeys: string[];
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
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
}

/**
 * projectRoot の lism.config を反映した main / full の BuildConfig を読み込む。
 */
export async function loadBuildConfigs(projectRoot: string, opts: LoadBuildConfigsOptions = {}): Promise<LoadedBuildConfigs> {
  const userConfigPath = findUserConfigPath(projectRoot, opts.configPath);
  let userConfig: Record<string, unknown> = {};
  if (userConfigPath) {
    // mtime をクエリに付けて ESM モジュールキャッシュをバストする（dev で lism.config.js 変更を拾うため）。
    const mtime = fs.statSync(userConfigPath).mtimeMs;
    const userMod = (await import(`${pathToFileURL(userConfigPath).href}?v=${mtime}`)) as { default?: Record<string, unknown> };
    userConfig = userMod.default ?? {};
  }

  const { mainConfig, fullConfig, isFullMode } = computeBuildConfigs({
    defaultConfig: defaultConfig as unknown as BuildConfig,
    propsFull: propsFull as Record<string, PropConfig>,
    userConfig,
    objDeepMerge,
  });
  return {
    mainConfig,
    fullConfig,
    defaultPropKeys: Object.keys(defaultConfig.props),
    defaultTraitKeys: Object.keys(defaultConfig.traits ?? {}),
    isFullMode,
    userConfigPath,
  };
}
