/**
 * SCSS-source 消費者向けの bridge 生成 builder。
 *
 * CSS を JS バンドラ経由で取り込まず、自前 SCSS ビルドでコンパイルする構成（例: WP テーマ）向け。
 * `lismDynamicCss`（Vite/Astro）や `generated-css`（Next/webpack の CSS 事前生成）のような
 * 「config 反映済み CSS を出力する」経路とは異なり、ここでは **config 反映済みの lism setting を
 * `@use`/`@forward` で消費できる SCSS の bridge** を生成する。これにより消費側は深い相対パスや
 * 手書きの `@forward ... with (...)` を書かずに lism（config 適用済み）を `@use` できる。
 *
 * 生成物（既定 outDir = `<projectRoot>/.lism-css/scss`、CSS モードの `.lism-css/css` と対称）:
 * - `_lism-config.gen.scss` = `serializeConfigScss(mainConfig)`（値: `$props` / `$breakpoints` / `$default_important`）
 * - `lism-setting.scss` = 固定 bridge（下記）
 *
 * ```scss
 * @use 'lism-config.gen' as cfg;
 * @forward 'pkg:lism-css/scss/setting' with (
 *     $props: cfg.$props,
 *     $breakpoints: cfg.$breakpoints,
 *     $default_important: cfg.$default_important
 * );
 * ```
 *
 * 消費側は `loadPaths: ['.lism-css/scss']` + `NodePackageImporter`（dart-sass ≥ 1.71）で、
 * 以下のように **必ず lism-setting → main_no_layer の順**で `@use` する。bridge が `setting` を
 * config 付きで先にロード・configure する必要があるため、順序を逆にすると sass エラーになる。
 *
 * ```scss
 * @use 'lism-setting';                      // bridge: setting を config 付きでロード
 * @use 'pkg:lism-css/scss/main_no_layer';   // configure 済みの setting を再利用
 * ```
 *
 * NOTE: SCSS の bridge 生成は webpack 評価とタイミングが異なる（消費側 build:css の冒頭で呼ぶ）ため、
 * `withLismWebpack` には畳み込まず、builder の独立 export とする。
 */
import fs from 'node:fs';
import path from 'node:path';

import { loadBuildConfigs } from './load-config';
import { serializeConfigScss } from './serialize';

/** config 値を流し込む生成 partial（同ディレクトリの兄弟解決。loadPaths 不要）。 */
const CONFIG_GEN_FILENAME = '_lism-config.gen.scss';
/** 消費側が `@use 'lism-setting'` で読む bridge。 */
const SETTING_FILENAME = 'lism-setting.scss';

/**
 * `lism-setting.scss` の固定 bridge。`_lism-config.gen.scss` の値を `pkg:lism-css/scss/setting` へ
 * `@forward ... with (...)` で流し込む。`@use 'lism-config.gen'` は同ディレクトリの兄弟解決。
 */
const BRIDGE_SETTING_SCSS = `@use 'lism-config.gen' as cfg;
@forward 'pkg:lism-css/scss/setting' with (
    $props: cfg.$props,
    $breakpoints: cfg.$breakpoints,
    $default_important: cfg.$default_important
);
`;

export interface GenerateLismScssOptions {
  /** lism.config 探索の基点となるプロジェクトルート。 */
  projectRoot: string;
  /** bridge の出力先ディレクトリ。既定は `<projectRoot>/.lism-css/scss`。 */
  outDir?: string;
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
}

export interface GeneratedLismScss {
  /** 出力先ディレクトリの絶対パス。 */
  outDir: string;
  /** 生成した `_lism-config.gen.scss` の絶対パス。 */
  configFile: string;
  /** 生成した `lism-setting.scss` の絶対パス。 */
  settingFile: string;
  /** 見つかった user lism.config の絶対パス（無ければ null）。watch 対象に使える。 */
  userConfigPath: string | null;
}

/**
 * config 反映済み setting の bridge SCSS を `outDir` へ生成する。
 *
 * `loadBuildConfigs` で mainConfig（defaults + lism.config をマージ済み）を取得し、
 * `_lism-config.gen.scss`（値）と `lism-setting.scss`（bridge）を書き出す。
 */
export async function generateLismScss(opts: GenerateLismScssOptions): Promise<GeneratedLismScss> {
  const { projectRoot, configPath } = opts;
  const outDir = opts.outDir ?? path.join(projectRoot, '.lism-css/scss');

  const { mainConfig, userConfigPath } = await loadBuildConfigs(projectRoot, { configPath });

  fs.mkdirSync(outDir, { recursive: true });
  const configFile = path.join(outDir, CONFIG_GEN_FILENAME);
  const settingFile = path.join(outDir, SETTING_FILENAME);
  fs.writeFileSync(configFile, serializeConfigScss(mainConfig), 'utf8');
  fs.writeFileSync(settingFile, BRIDGE_SETTING_SCSS, 'utf8');

  return { outDir, configFile, settingFile, userConfigPath };
}
