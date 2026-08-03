/**
 * `pages/` の自動発見とメタデータのマージ。
 *
 * 画面一覧の正本はファイルシステム側（`pages/**\/*.{jsx,tsx}`）で、`mock.config.json` は
 * ラベル・カテゴリ・並び順の上書きだけを担う。「ページを追加したのに登録し忘れて出てこない」を作らないため。
 */
import fs from 'node:fs';
import path from 'node:path';

import { MOCK_CONFIG_FILENAME } from './data-dir.js';
import { isInsideDir, safeRealpath } from './paths.js';
import { MockContractError, type MockConfigFile, type PageEntry } from './types.js';

export const PAGES_DIRNAME = 'pages';
export const PAGE_EXTENSIONS = ['.jsx', '.tsx'] as const;

/** 走査から除外するディレクトリ（ドット始まりは別途除外）。 */
const SKIP_DIRS = new Set(['node_modules']);

function walkPageFiles(dir: string, prefix: string, out: { id: string; file: string }[]): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkPageFiles(full, `${prefix}${entry.name}/`, out);
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;

    const ext = path.extname(entry.name);
    if (!(PAGE_EXTENSIONS as readonly string[]).includes(ext)) continue;
    out.push({ id: `${prefix}${entry.name.slice(0, -ext.length)}`, file: full });
  }
}

/**
 * `pages/` を再帰的に走査してページを列挙し、`mock.config.json` のメタデータをマージする。
 *
 * 並び順は `order` 昇順 → id 辞書順。`order` 未指定のページは指定済みページの後ろへ回す。
 */
export function discoverPages(dataDir: string, config: MockConfigFile): PageEntry[] {
  const pagesDir = path.join(dataDir, PAGES_DIRNAME);
  if (!fs.existsSync(pagesDir) || !fs.statSync(pagesDir).isDirectory()) {
    throw new MockContractError(
      `"${PAGES_DIRNAME}/" directory not found in the data directory. Create ${PAGES_DIRNAME}/ and add at least one .jsx or .tsx page.`,
      { file: pagesDir }
    );
  }

  const found: { id: string; file: string }[] = [];
  walkPageFiles(pagesDir, '', found);

  if (found.length === 0) {
    throw new MockContractError(`No pages found in "${PAGES_DIRNAME}/". Add at least one .jsx or .tsx file that default-exports a React component.`, {
      file: pagesDir,
    });
  }

  const byId = new Map<string, string>();
  for (const { id, file } of found) {
    const existing = byId.get(id);
    if (existing) {
      throw new MockContractError(
        `Duplicate page id "${id}": ${path.relative(dataDir, existing)} and ${path.relative(dataDir, file)} resolve to the same id. Rename one of them.`,
        { file }
      );
    }
    // pages/ 内のシンボリックリンクでデータディレクトリ外を参照させない。
    const real = safeRealpath(file);
    if (!isInsideDir(dataDir, real)) {
      throw new MockContractError(`Page "${id}" resolves outside the data directory (${real}). Pages must live inside the data directory.`, {
        file,
      });
    }
    byId.set(id, real);
  }

  const meta = config.pages ?? {};
  for (const pageId of Object.keys(meta)) {
    if (!byId.has(pageId)) {
      throw new MockContractError(
        `${MOCK_CONFIG_FILENAME} references an unknown page id "${pageId}". Page ids come from ${PAGES_DIRNAME}/ (path without extension); remove the entry or add ${PAGES_DIRNAME}/${pageId}.jsx.`,
        { file: path.join(dataDir, MOCK_CONFIG_FILENAME) }
      );
    }
  }

  const pages: PageEntry[] = [...byId.entries()].map(([id, file]) => {
    const entry: PageEntry = { id, file, label: meta[id]?.label ?? id };
    if (meta[id]?.category !== undefined) entry.category = meta[id].category;
    if (meta[id]?.order !== undefined) entry.order = meta[id].order;
    return entry;
  });

  return sortPages(pages);
}

/** `order` 昇順（未指定は末尾）→ id 辞書順。 */
export function sortPages(pages: PageEntry[]): PageEntry[] {
  return [...pages].sort((a, b) => {
    const orderA = a.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.order ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
