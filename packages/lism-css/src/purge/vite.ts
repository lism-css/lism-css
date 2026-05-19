import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { extractLismClasses } from './extract';
import { extractKnownLismSelectors, purgeLismCss, type KnownSelectorSet, type SafelistEntry } from './core';

export interface LismPurgeOptions {
  safelist?: SafelistEntry[];
  known?: KnownSelectorSet;
  report?: boolean;
}

const LISM_CSS_SIGNATURE = /\.(?:-[a-z]|[a-z]+--)/;

function decodeAssetSource(source: string | Uint8Array): string {
  return typeof source === 'string' ? source : new TextDecoder().decode(source);
}

function loadDefaultKnownSelectors(): KnownSelectorSet | undefined {
  try {
    const css = readFileSync(new URL(/* @vite-ignore */ '../css/main.css', import.meta.url), 'utf8');
    return extractKnownLismSelectors(css);
  } catch {
    return undefined;
  }
}

export function lismPurge(options: LismPurgeOptions = {}): Plugin {
  const known = options.known ?? loadDefaultKnownSelectors();

  return {
    name: 'lism-css:purge',
    apply: 'build',
    enforce: 'post',
    generateBundle(_outputOptions, bundle) {
      const used = new Set<string>();
      const cssTargets: string[] = [];

      for (const [key, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset') {
          if (key.endsWith('.css')) {
            cssTargets.push(key);
            continue;
          }
          if (/\.(html?|js|mjs|cjs)$/.test(key)) {
            extractLismClasses(decodeAssetSource(asset.source), used);
          }
        } else if (asset.type === 'chunk') {
          extractLismClasses(asset.code, used);
        }
      }

      let beforeBytes = 0;
      let afterBytes = 0;

      for (const key of cssTargets) {
        const asset = bundle[key];
        if (asset.type !== 'asset') continue;
        const source = decodeAssetSource(asset.source);
        if (!LISM_CSS_SIGNATURE.test(source)) continue;
        const purged = purgeLismCss(source, { used, safelist: options.safelist, known });
        beforeBytes += source.length;
        afterBytes += purged.length;
        asset.source = purged;
      }

      if (options.report && beforeBytes > 0) {
        const saved = beforeBytes - afterBytes;
        const pct = ((saved / beforeBytes) * 100).toFixed(1);
        console.log(`[lism-purge] CSS: ${beforeBytes} → ${afterBytes} bytes (-${saved} / -${pct}%)`);
      }
    },
  };
}
