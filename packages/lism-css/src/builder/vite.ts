/**
 * 傘エントリ（#427 / #424 進行順序 4 の P3）。
 *
 * `lism-css/vite` から公開する統合エントリ:
 * - `lismCss(options)`        … Vite 用。config alias + 動的 CSS ビルド（P2）+ 任意で purge をまとめた `Plugin[]`。
 * - `lismCssAstro(options)`   … Astro 用。`astro:config:setup` で上記 Vite プラグインを注入し、任意で purge integration を足す。
 *
 * purge の `known`（purge が削除対象にしてよい lism セレクタのカタログ）は、未指定なら **config 反映済みの
 * full.css**（プラグインが生成する素の CSS のスーパーセット）から構築して遅延解決（`resolveKnownSelectors`）へ渡す。
 * known に含まれないクラスは「unknown（=user 由来かもしれない）」として温存されるため、user が lism.config.js で
 * 追加した prop/トークン由来のクラスも known に入れておくことで、その未使用分まで正しく purge できる。
 *
 * NOTE: `purge/vite`・`purge/astro` 単体エクスポートと、config alias 単体の `vite-plugin.mjs` は後方互換で維持する。
 */
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { AstroIntegration } from 'astro';

import { lismCssVite, type LismCssViteOptions } from './vite-css';
import { lismConfigAlias } from './vite-config-alias';
import { loadBuildConfigs } from './load-config';
import { createCssCompiler } from './compile-entry';
import { scssDir } from './paths';
import { lismPurge, type LismPurgeOptions } from '../purge/vite';
import { lismPurgeAstro } from '../purge/astro';
import { extractKnownLismSelectors, type KnownSelectorSet } from '../purge/core';
import { loadDefaultKnownSelectors } from '../purge/shared';

export interface LismCssOptions extends LismCssViteOptions {
  /** purge を有効化する。`true` で既定設定、オブジェクトで `lismPurge` のオプションを指定。 */
  purge?: boolean | LismPurgeOptions;
}

/** config 反映済みの full.css をコンパイルして known セレクタ集合を作る（build 時に一度だけ実行）。 */
async function buildConfigAwareKnown(root: string): Promise<KnownSelectorSet | undefined> {
  const compiler = createCssCompiler({ scssDir });
  try {
    const { mainConfig, fullConfig } = await loadBuildConfigs(root || process.cwd());
    const css = await compiler.compile('full', mainConfig, fullConfig);
    return extractKnownLismSelectors(css);
  } catch {
    // 失敗時は呼び出し側で同梱 full.css 由来のデフォルトへフォールバックする。
    return undefined;
  } finally {
    compiler.dispose();
  }
}

/** purge を有効化するか + 生成 known を使うか（user が known 明示時は使わない）を判定する。 */
function resolvePurge(purge: LismCssOptions['purge']): { enabled: boolean; opts: LismPurgeOptions; useGeneratedKnown: boolean } {
  const enabled = !!purge;
  const opts: LismPurgeOptions = typeof purge === 'object' ? purge : {};
  return { enabled, opts, useGeneratedKnown: enabled && opts.known === undefined };
}

/**
 * Vite 用の統合プラグイン配列を返す。
 */
export function lismCss(options: LismCssOptions = {}): Plugin[] {
  const { purge, ...viteOpts } = options;
  const plugins: Plugin[] = [lismConfigAlias(viteOpts), lismCssVite(viteOpts)];

  const { enabled, opts, useGeneratedKnown } = resolvePurge(purge);
  if (!enabled) return plugins;

  const knownRef: { value: KnownSelectorSet | undefined } = { value: undefined };

  if (useGeneratedKnown) {
    let root = '';
    plugins.push({
      name: 'lism-css:known',
      apply: 'build',
      enforce: 'pre',
      configResolved(c) {
        root = c.root;
      },
      async buildStart() {
        knownRef.value = await buildConfigAwareKnown(root);
      },
    });
  }

  plugins.push(
    lismPurge({
      ...opts,
      known: useGeneratedKnown ? () => knownRef.value ?? loadDefaultKnownSelectors() : opts.known,
    })
  );

  return plugins;
}

/**
 * Astro 用の統合（integration 配列）を返す。`integrations` 直下に置く。
 */
export function lismCssAstro(options: LismCssOptions = {}): AstroIntegration[] {
  const { purge, ...viteOpts } = options;
  const { enabled, opts, useGeneratedKnown } = resolvePurge(purge);

  const knownRef: { value: KnownSelectorSet | undefined } = { value: undefined };
  let root = '';

  const setup: AstroIntegration = {
    name: 'lism-css',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        root = fileURLToPath(config.root);
        updateConfig({ vite: { plugins: [lismConfigAlias(viteOpts), lismCssVite(viteOpts)] } });
      },
      'astro:build:start': async () => {
        if (useGeneratedKnown) knownRef.value = await buildConfigAwareKnown(root);
      },
    },
  };

  const integrations: AstroIntegration[] = [setup];
  if (enabled) {
    integrations.push(
      lismPurgeAstro({
        ...opts,
        known: useGeneratedKnown ? () => knownRef.value ?? loadDefaultKnownSelectors() : opts.known,
      })
    );
  }
  return integrations;
}

export default lismCss;
