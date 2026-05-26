import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { AstroIntegration } from 'astro';
import { extractLismClasses } from './extract';
import { purgeLismCss, type SafelistEntry } from './core';
import type { LismPurgeOptions } from './options';
import { LISM_CSS_SIGNATURE, formatReport, loadDefaultKnownSelectors } from './shared';

export type { LismPurgeOptions } from './options';

const SCAN_EXT = /\.(html?|js|mjs|cjs)$/;
const CSS_EXT = /\.css$/;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

export function lismPurgeAstro(options: LismPurgeOptions = {}): AstroIntegration {
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
          logger.info(formatReport(beforeBytes, afterBytes));
        }
      },
    },
  };
}
