/**
 * Astro 用の統合エントリ。
 *
 * `@lism-css/plugin/astro` から公開し、Vite 用と同じ `lismCss()` 名で利用する。
 */
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

import { lismDynamicCss } from './dynamic-css';
import { lismConfigAlias } from './vite-config-alias';
import { lismTypegen } from './vite-typegen';
import { lismPurgeAstro } from '../purge/astro';
import { loadDefaultKnownSelectors } from '../purge/shared';
import { buildConfigAwareKnown, resolvePurge, type LismCssOptions } from './shared';
import type { KnownSelectorSet } from '../purge/core';

export type { LismCssOptions } from './shared';

/**
 * Astro 用の統合（integration 配列）を返す。`integrations` 直下に置く。
 */
export function lismCss(options: LismCssOptions = {}): AstroIntegration[] {
  const { purge, typegen, ...viteOpts } = options;
  const { enabled, opts, useGeneratedKnown } = resolvePurge(purge);

  const knownRef: { value: KnownSelectorSet | undefined } = { value: undefined };
  let root = '';

  const setup: AstroIntegration = {
    name: 'lism-css',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        root = fileURLToPath(config.root);
        updateConfig({
          vite: {
            plugins: [
              lismConfigAlias(viteOpts),
              lismTypegen({ disabled: typegen === false, configPath: viteOpts.configPath }),
              lismDynamicCss(viteOpts),
            ],
          },
        });
      },
      'astro:build:start': async () => {
        if (useGeneratedKnown) knownRef.value = await buildConfigAwareKnown(root, viteOpts.configPath);
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
