import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * パッケージ同梱のスキルディレクトリを解決する。
 *
 * - 配布時: `@lism-css/cli/skills/lism-css-guide` （package の `files` に含まれる）
 * - モノレポ開発時: `packages/lism-cli/skills/lism-css-guide` が空の場合、
 *   リポジトリ直下の `skills/lism-css-guide` にフォールバック
 */
export function resolveSkillSourceDir(): string {
  // dist/index.js の位置から遡って package ルート直下の skills を探す
  const pkgSkills = path.resolve(__dirname, '..', 'skills', 'lism-css-guide');
  if (fs.existsSync(path.join(pkgSkills, 'SKILL.md'))) return pkgSkills;

  // モノレポ開発時フォールバック（dist/ から packages/lism-cli/../.. を辿る）
  const repoSkills = path.resolve(__dirname, '..', '..', '..', '..', 'skills', 'lism-css-guide');
  if (fs.existsSync(path.join(repoSkills, 'SKILL.md'))) return repoSkills;

  throw new Error('パッケージ同梱のスキルディレクトリが見つかりません。`pnpm build` 済みか確認してください。');
}

/** SKILL.md のフロントマターから version を取得する（無ければ null） */
export function readSkillVersion(skillDir: string): string | null {
  const skillPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;
  const raw = fs.readFileSync(skillPath, 'utf-8');
  // フロントマターの1行 `version: x.y.z` を拾う（YAML パーサは使わず単純マッチ）
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = m[1];
  const vm = fm.match(/^version:\s*['"]?([^\n'"]+)['"]?\s*$/m);
  return vm ? vm[1].trim() : null;
}

/** ディレクトリを再帰的に src → dest へコピー（src 配下のみ。シンボリックリンクは辿らない） */
export function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
