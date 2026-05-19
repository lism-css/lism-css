import { readFileSync } from 'node:fs';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { extractLismClasses } from './extract';
import { extractKnownLismSelectors, purgeLismCss, type KnownSelectorSet, type SafelistEntry } from './core';
import type { LismPurgeOptions } from './vite';

export type { LismPurgeOptions };

interface AstroIntegrationLike {
  name: string;
  hooks: {
    'astro:build:done': (params: { dir: URL; logger?: { info: (msg: string) => void } }) => Promise<void> | void;
  };
}

const LISM_CSS_SIGNATURE = /\.(?:-[a-z]|[a-z]+--)/;
const SCAN_EXT = /\.(html?|js|mjs|cjs)$/;
const CSS_EXT = /\.css$/;

function loadDefaultKnownSelectors(): KnownSelectorSet | undefined {
  try {
    const css = readFileSync(new URL(/* @vite-ignore */ '../css/main.css', import.meta.url), 'utf8');
    return extractKnownLismSelectors(css);
  } catch {
    return undefined;
  }
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const st = await stat(full);
    if (st.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

export function lismPurgeAstro(options: LismPurgeOptions = {}): AstroIntegrationLike {
  const safelist: SafelistEntry[] | undefined = options.safelist;
  const known = options.known ?? loadDefaultKnownSelectors();
  const report = options.report ?? false;

  return {
    name: 'lism-css:purge',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distPath = fileURLToPath(dir);
        const used = new Set<string>();
        const cssFiles: string[] = [];

        for await (const file of walk(distPath)) {
          if (SCAN_EXT.test(file)) {
            extractLismClasses(await readFile(file, 'utf8'), used);
          } else if (CSS_EXT.test(file)) {
            cssFiles.push(file);
          }
        }

        let beforeBytes = 0;
        let afterBytes = 0;

        for (const file of cssFiles) {
          const source = await readFile(file, 'utf8');
          if (!LISM_CSS_SIGNATURE.test(source)) continue;
          const purged = purgeLismCss(source, { used, safelist, known });
          if (purged === source) continue;
          await writeFile(file, purged, 'utf8');
          beforeBytes += source.length;
          afterBytes += purged.length;
        }

        if (report && beforeBytes > 0) {
          const saved = beforeBytes - afterBytes;
          const pct = ((saved / beforeBytes) * 100).toFixed(1);
          const msg = `CSS: ${beforeBytes} → ${afterBytes} bytes (-${saved} / -${pct}%)`;
          if (logger) logger.info(msg);
          else console.log(`[lism-purge] ${msg}`);
        }
      },
    },
  };
}
