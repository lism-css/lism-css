/**
 * Vite 用の統合エントリ。
 *
 * `@lism-css/plugin/vite` から公開する統合エントリ:
 * - `lismCss(options)` … config alias + 動的 CSS ビルド（P2）+ 任意で purge をまとめた `Plugin[]`。
 *
 * purge の `known`（purge が削除対象にしてよい lism セレクタのカタログ）は、未指定なら **config 反映済みの
 * full.css**（プラグインが生成する素の CSS のスーパーセット）から構築して遅延解決（`resolveKnownSelectors`）へ渡す。
 * known に含まれないクラスは「unknown（=user 由来かもしれない）」として温存されるため、user が lism.config.js で
 * 追加した prop/トークン由来のクラスも known に入れておくことで、その未使用分まで正しく purge できる。
 *
 * NOTE: `purge/vite`・`purge/astro` 単体エクスポートも plugin パッケージ側で維持する。
 */
import type { Plugin } from 'vite';

import { lismDynamicCss } from './dynamic-css';
import { lismConfigAlias } from './vite-config-alias';
import { lismTypegen } from './vite-typegen';
import { lismPurge } from '../purge/vite';
import type { KnownSelectorSet } from '../purge/core';
import { loadDefaultKnownSelectors } from '../purge/shared';
import { buildConfigAwareKnown, resolvePurge, type LismCssOptions } from './shared';

export type { LismCssOptions } from './shared';

/**
 * Vite 用の統合プラグイン配列を返す。
 */
export function lismCss(options: LismCssOptions = {}): Plugin[] {
  const { purge, typegen, ...viteOpts } = options;
  const plugins: Plugin[] = [
    lismConfigAlias(viteOpts),
    lismTypegen({ disabled: typegen === false, configPath: viteOpts.configPath }),
    lismDynamicCss(viteOpts),
  ];

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
        knownRef.value = await buildConfigAwareKnown(root, viteOpts.configPath);
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

export default lismCss;
