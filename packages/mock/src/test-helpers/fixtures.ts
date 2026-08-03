/**
 * テスト用のデータディレクトリ生成ヘルパー。
 *
 * ビューアは worker 分担の関係でここに最小 fixture（`viewer/`）を置き、同梱ビューアの実装に依存させない。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const createdDirs: string[] = [];

/** 一時ディレクトリを作る（`cleanupTempDirs()` でまとめて削除する）。 */
export function createTempDir(prefix = 'lism-mock-test-'): string {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  createdDirs.push(dir);
  return dir;
}

/** 相対パス → 内容 のマップからファイルを書き出す。 */
export function writeFiles(dir: string, files: Record<string, string>): void {
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf-8');
  }
}

/** 一時データディレクトリを作ってファイルを書き出す。 */
export function createDataDir(files: Record<string, string>): string {
  const dir = createTempDir();
  writeFiles(dir, files);
  return dir;
}

/** 作成した一時ディレクトリをすべて削除する。 */
export function cleanupTempDirs(): void {
  while (createdDirs.length > 0) {
    const dir = createdDirs.pop();
    if (!dir) continue;
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // 後片付けの失敗はテスト結果に影響させない。
    }
  }
}

/** テスト用の最小ビューア（vite root）。 */
export function getFixtureViewerDir(): string {
  return path.join(path.resolve(fileURLToPath(new URL('.', import.meta.url))), 'viewer');
}

export const MOCK_CONFIG = `${JSON.stringify({ schemaVersion: 1 }, null, 2)}\n`;

/** import を持たない最小ページ（bundle 検証を速く済ませたいテスト用）。 */
export const PLAIN_PAGE = `export default function Page() {\n  return <div className="p-4">hello</div>;\n}\n`;
