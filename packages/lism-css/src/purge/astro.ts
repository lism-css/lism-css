import { createHash } from 'node:crypto';
import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { extractLismClasses } from './extract';
import { purgeLismCss, type KnownSelectorSet, type SafelistEntry } from './core';
import type { LismPurgeOptions } from './options';
import { LISM_CSS_SIGNATURE, formatReport, resolveKnownSelectors, stripCssSourceMappingUrl } from './shared';

export type { LismPurgeOptions } from './options';

const SCAN_EXT = /\.(html?|js|mjs|cjs)$/;
const CSS_EXT = /\.css$/;
// 参照更新の対象拡張子: HTML / JS / JSON manifest / sourcemap / RSS など、文字列で参照を持ち得るもの
const REF_EXT = /\.(html?|js|mjs|cjs|json|txt|xml|map)$/;
// `<name>.<hash>.css` 形式のハッシュ部を判定する。Astro / Vite 既定では 8 文字英数字。
const HASHED_CSS_NAME = /^(.+)\.([A-Za-z0-9_-]{6,})\.css$/;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      try {
        const st = await stat(full);
        if (st.isDirectory()) yield* walk(full);
        else if (st.isFile()) yield full;
      } catch {
        // broken symlink: skip
      }
    } else if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function shortContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function isNoEntryError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

async function deleteStaleCssMap(file: string): Promise<void> {
  try {
    await unlink(`${file}.map`);
  } catch (error) {
    if (!isNoEntryError(error)) throw error;
  }
}

interface RenameInfo {
  oldBase: string;
  newBase: string;
}

async function purgeCssFiles(
  cssFiles: string[],
  used: Set<string>,
  safelist: SafelistEntry[] | undefined,
  known: KnownSelectorSet | undefined
): Promise<{ renames: RenameInfo[]; beforeBytes: number; afterBytes: number }> {
  const renames: RenameInfo[] = [];
  let beforeBytes = 0;
  let afterBytes = 0;

  for (const file of cssFiles) {
    const source = await readFile(file, 'utf8');
    if (!LISM_CSS_SIGNATURE.test(source)) continue;
    const purged = stripCssSourceMappingUrl(purgeLismCss(source, { used, safelist, known }));
    if (purged === source) continue;

    beforeBytes += source.length;
    afterBytes += purged.length;

    const oldBase = basename(file);
    const match = HASHED_CSS_NAME.exec(oldBase);
    if (match) {
      // 内容ベースのハッシュ部を新内容で再計算し、ファイル名を更新する。
      // 参照側 (HTML/JS/manifest) も後段で同期して書き換えるためキャッシュ整合が保たれる。
      const newHash = shortContentHash(purged);
      const newBase = `${match[1]}.${newHash}.css`;
      if (newBase !== oldBase) {
        const newPath = join(dirname(file), newBase);
        await writeFile(newPath, purged, 'utf8');
        await unlink(file);
        renames.push({ oldBase, newBase });
      } else {
        await writeFile(file, purged, 'utf8');
      }
    } else {
      // ハッシュ無しの CSS は in-place 上書き
      await writeFile(file, purged, 'utf8');
    }
    await deleteStaleCssMap(file);
  }
  return { renames, beforeBytes, afterBytes };
}

async function updateReferences(distPath: string, renames: RenameInfo[]): Promise<void> {
  if (renames.length === 0) return;
  for await (const file of walk(distPath)) {
    if (!REF_EXT.test(file)) continue;
    let content = await readFile(file, 'utf8');
    let changed = false;
    for (const { oldBase, newBase } of renames) {
      if (content.includes(oldBase)) {
        content = content.split(oldBase).join(newBase);
        changed = true;
      }
    }
    if (changed) await writeFile(file, content, 'utf8');
  }
}

export function lismPurgeAstro(options: LismPurgeOptions = {}): AstroIntegration {
  const safelist: SafelistEntry[] | undefined = options.safelist;
  const report = options.report ?? false;

  return {
    name: 'lism-css:purge',
    hooks: {
      // Astro の SSG では HTML 生成が Vite build より後に走るため、Vite plugin 経由では
      // 最終 HTML のクラスを拾えない。`astro:build:done` で dist を直接走査し、
      // CSS を purge した上で内容ベースの hash を再計算して参照側も同期更新する。
      'astro:build:done': async ({ dir, logger }) => {
        // known は build 実行時に解決する（関数形式の遅延解決にも対応）。
        const known = resolveKnownSelectors(options.known);
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

        const { renames, beforeBytes, afterBytes } = await purgeCssFiles(cssFiles, used, safelist, known);
        await updateReferences(distPath, renames);

        if (report && beforeBytes > 0) {
          logger.info(formatReport(beforeBytes, afterBytes));
        }
      },
    },
  };
}
