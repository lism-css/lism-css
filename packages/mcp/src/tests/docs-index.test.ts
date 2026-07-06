import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourcePathToUrlSlug } from '../lib/search.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const docsIndexPath = resolve(__dirname, '..', 'data', 'docs-index.json');
const docsContentDir = resolve(__dirname, '..', '..', '..', '..', 'apps', 'docs', 'src', 'content', 'ja');

// apps/docs 依存のモジュールを static import すると、apps/docs がない環境では
// describe.skipIf の評価前にモジュールロードで落ちるため、存在確認後に動的 import する
const toContentSlug = existsSync(docsContentDir) ? (await import('../../../../apps/docs/src/lib/contentSlug.js')).toContentSlug : null;

type IndexEntry = { sourcePath: string };

const entries: IndexEntry[] = JSON.parse(readFileSync(docsIndexPath, 'utf-8'));

/** インデックス収録対象の MDX ファイル一覧（`_` 始まりのファイル/ディレクトリと test.mdx は対象外） */
function listIndexableMdxFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...listIndexableMdxFiles(full, baseDir));
    } else if (entry.endsWith('.mdx') && entry !== 'test.mdx') {
      results.push(relative(baseDir, full).split('\\').join('/'));
    }
  }
  return results;
}

// docs-index.json は LLM ベースの /mcp-update で手動更新されるため、
// 実 MDX ファイルとの構造的な整合性をここで機械的に検証する（#465）。
// apps/docs が存在しない環境（npm 配布物単体など）ではスキップする。
describe.skipIf(!existsSync(docsContentDir))('docs-index.json の構造検証', () => {
  it('全エントリの sourcePath が apps/docs/src/content/ja/ の実ファイルを指している', () => {
    const missing = entries.map((e) => e.sourcePath).filter((p) => !existsSync(resolve(docsContentDir, p)));
    expect(missing).toEqual([]);
  });

  it('収録対象の MDX ファイルがすべてインデックスに含まれている（収録漏れ検出）', () => {
    const indexed = new Set(entries.map((e) => e.sourcePath));
    const notIndexed = listIndexableMdxFiles(docsContentDir).filter((p) => !indexed.has(p));
    expect(notIndexed).toEqual([]);
  });

  // sourcePathToUrlSlug は apps/docs 側の toContentSlug と手動同期の複製実装のため、
  // 全 sourcePath について両者の変換結果が一致することを検証してドリフトを検出する
  it('URL スラッグ変換が apps/docs の toContentSlug と一致する', () => {
    for (const sourcePath of new Set(entries.map((e) => e.sourcePath))) {
      const rawSlug = sourcePath.replace(/\.mdx$/, '');
      expect(sourcePathToUrlSlug(sourcePath), sourcePath).toBe(toContentSlug!(rawSlug));
    }
  });
});
