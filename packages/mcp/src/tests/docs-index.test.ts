import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourcePathToUrlSlug } from '../lib/search.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const docsIndexPath = resolve(__dirname, '..', 'data', 'docs-index.json');
const docsContentDir = resolve(__dirname, '..', '..', '..', '..', 'apps', 'site', 'src', 'content', 'ja');

// apps/site 依存のモジュールを static import すると、apps/site がない環境では
// describe.skipIf の評価前にモジュールロードで落ちるため、存在確認後に動的 import する
const toContentSlug = existsSync(docsContentDir) ? (await import('../../../../apps/site/src/lib/contentSlug.js')).toContentSlug : null;

type IndexEntry = { sourcePath: string };

const entries: IndexEntry[] = JSON.parse(readFileSync(docsIndexPath, 'utf-8'));

/** frontmatter が `draft: true` か。draft ページは本番ビルドで生成されず、公開 URL が 404 になる */
function isDraft(file: string): boolean {
  const frontmatter = readFileSync(file, 'utf-8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

/** インデックス収録対象の MDX ファイル一覧（`_` 始まりのファイル/ディレクトリ・test.mdx・draft ページは対象外） */
function listIndexableMdxFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...listIndexableMdxFiles(full, baseDir));
    } else if (entry.endsWith('.mdx') && entry !== 'test.mdx' && !isDraft(full)) {
      results.push(relative(baseDir, full).split('\\').join('/'));
    }
  }
  return results;
}

// docs-index.json は LLM ベースの /mcp-update で手動更新されるため、
// 実 MDX ファイルとの構造的な整合性をここで機械的に検証する（#465）。
// apps/site が存在しない環境（npm 配布物単体など）ではスキップする。
describe.skipIf(!existsSync(docsContentDir))('docs-index.json の構造検証', () => {
  it('全エントリの sourcePath が apps/site/src/content/ja/ の実ファイルを指している', () => {
    const missing = entries.map((e) => e.sourcePath).filter((p) => !existsSync(resolve(docsContentDir, p)));
    expect(missing).toEqual([]);
  });

  it('収録対象の MDX ファイルがすべてインデックスに含まれている（収録漏れ検出）', () => {
    const indexed = new Set(entries.map((e) => e.sourcePath));
    const notIndexed = listIndexableMdxFiles(docsContentDir).filter((p) => !indexed.has(p));
    expect(notIndexed).toEqual([]);
  });

  it('draft ページがインデックスに含まれていない', () => {
    const drafts = entries
      .map((e) => e.sourcePath)
      .filter((p) => {
        const file = resolve(docsContentDir, p);
        return existsSync(file) && isDraft(file);
      });
    expect(drafts).toEqual([]);
  });

  // sourcePathToUrlSlug は apps/site 側の toContentSlug と手動同期の複製実装のため、
  // 全 sourcePath について両者の変換結果が一致することを検証してドリフトを検出する
  it('URL スラッグ変換が apps/site の toContentSlug と一致する', () => {
    for (const sourcePath of new Set(entries.map((e) => e.sourcePath))) {
      const rawSlug = sourcePath.replace(/\.mdx$/, '');
      expect(sourcePathToUrlSlug(sourcePath), sourcePath).toBe(toContentSlug!(rawSlug));
    }
  });
});
