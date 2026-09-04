/**
 * SCSS-source 消費者向けの bridge 生成 builder。
 *
 * CSSをJSバンドラ経由で取り込まず、自前SCSSビルドでコンパイルする構成向け。
 * 利用には`loadPaths: ['.lism-css/scss']`と`NodePackageImporter`（dart-sass>=1.71）が必要。
 * **必ずlism-setting → main_no_layerの順**で`@use`する。bridgeが`setting`を
 * config 付きで先にロード・configure する必要があるため、順序を逆にすると sass エラーになる。
 *
 * NOTE: `main_no_layer` は Property Class の `!important` を `$layer_mode: 0` から常に付与する（`_mixin.scss`）ため、
 * bridge で渡す `$default_important` は `@layer` ありエントリ（`main` 等）にだけ効く。
 *
 * NOTE: SCSS の bridge 生成は webpack 評価とタイミングが異なる（消費側 build:css の冒頭で呼ぶ）ため、
 * `withLismWebpack` には畳み込まず、builder の独立 export とする。
 */
import fs from 'node:fs';
import path from 'node:path';

import { loadBuildConfigs } from './load-config';
import { serializeConfigScss } from './serialize';

const CONFIG_GEN_FILENAME = '_lism-config.gen.scss';
const SETTING_FILENAME = 'lism-setting.scss';

const BRIDGE_SETTING_SCSS = `@use 'lism-config.gen' as cfg;
@forward 'pkg:lism-css/scss/setting' with (
    $props: cfg.$props,
    $breakpoints: cfg.$breakpoints,
    $default_important: cfg.$default_important
);
`;

export interface GenerateLismScssOptions {
  projectRoot: string;
  outDir?: string;
  configPath?: string;
}

export interface GeneratedLismScss {
  outDir: string;
  configFile: string;
  settingFile: string;
  /** 見つかった user lism.config の絶対パス（無ければ null）。watch 対象に使える。 */
  userConfigPath: string | null;
}

/** config反映済みsettingのbridge SCSSを生成する。 */
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
