import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// スキル Markdown の正本を直接参照（開発・テスト時）
// npm パッケージとして利用される場合は dist/data/guides/ にフォールバック
const skillsDir = resolve(__dirname, '..', '..', '..', '..', '.claude', 'skills', 'lism-css-guide');
const distDir = resolve(__dirname, '..', 'data', 'guides');
const guidesDir = existsSync(skillsDir) ? skillsDir : distDir;

const cache = new Map<string, string>();

/** guides/ ディレクトリから Markdown ファイルを読み込む（キャッシュ付き） */
export function loadMarkdown(filename: string): string {
  if (cache.has(filename)) return cache.get(filename)!;
  const filePath = resolve(guidesDir, filename);
  const content = readFileSync(filePath, 'utf-8');
  cache.set(filename, content);
  return content;
}

/** 利用可能なガイドファイル名の一覧を返す */
export function getGuideFilenames(): string[] {
  return readdirSync(guidesDir).filter((f) => f.endsWith('.md'));
}

/** 起動時に全ガイドを一括読み込みしてキャッシュに載せる */
export function preloadGuides(): void {
  for (const filename of getGuideFilenames()) {
    loadMarkdown(filename);
  }
}
