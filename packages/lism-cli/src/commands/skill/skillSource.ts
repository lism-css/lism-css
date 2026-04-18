import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { downloadTemplate } from 'giget';

/** スキル取得元の GitHub リポジトリ内パス */
const SKILL_REMOTE = 'github:lism-css/lism-css/skills/lism-css-guide';

/** ref が未指定の場合のデフォルト参照先 */
// FIXME(#290 マージ前): 'main' に戻すこと。publish 後に 'dev' のままだと取得先が永続的に dev を指す。
// TEST(#290): dev マージ前の beta 検証のため 'feat/cli-restructure' に一時差し替え。dev マージ時に 'dev' に戻すこと。
export const DEFAULT_SKILL_REF = 'feat/cli-restructure';

/**
 * 指定 ref のスキルをリモートから取得し、展開先ディレクトリパスを返す。
 * 呼び出し側は使用後に `cleanupTempDir` で削除する責務を持つ。
 */
export async function fetchSkillSource(ref: string = DEFAULT_SKILL_REF): Promise<{ dir: string; ref: string }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-skill-'));
  await downloadTemplate(`${SKILL_REMOTE}#${ref}`, {
    dir: tmpDir,
    force: true,
    forceClean: true,
  });
  return { dir: tmpDir, ref };
}

/** fetchSkillSource で作成した一時ディレクトリを削除する */
export function cleanupTempDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // 失敗しても致命ではないので握りつぶす
  }
}

/** ディレクトリ配下のファイルを再帰走査し、ルートからの相対パス一覧を返す */
function walkFiles(root: string): string[] {
  const results: string[] = [];
  const stack: string[] = [''];
  while (stack.length > 0) {
    const rel = stack.pop()!;
    const abs = path.join(root, rel);
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const childRel = rel ? path.join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) {
        stack.push(childRel);
      } else if (entry.isFile()) {
        results.push(childRel);
      }
    }
  }
  return results;
}

/** 指定ファイルの sha256 を 16 進で返す */
function hashFile(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export interface SkillDiff {
  /** 両方に存在し内容が一致 */
  unchanged: string[];
  /** 両方に存在するが内容が異なる */
  modified: string[];
  /** リモートにのみ存在（ローカルに新規追加される） */
  added: string[];
  /** ローカルにのみ存在（リモートから削除された旧ファイル or ユーザー独自ファイル） */
  localOnly: string[];
}

/**
 * ローカルスキルディレクトリとリモートスキルディレクトリを
 * ファイル単位の sha256 ハッシュで比較する。
 *
 * ローカルが存在しない場合は、リモートの全ファイルを `added` として返す。
 */
export function compareSkillDirs(localDir: string, remoteDir: string): SkillDiff {
  const localExists = fs.existsSync(localDir);
  const remoteFiles = new Set(walkFiles(remoteDir));
  const localFiles = new Set(localExists ? walkFiles(localDir) : []);

  const diff: SkillDiff = { unchanged: [], modified: [], added: [], localOnly: [] };

  for (const rel of remoteFiles) {
    if (!localFiles.has(rel)) {
      diff.added.push(rel);
      continue;
    }
    const localHash = hashFile(path.join(localDir, rel));
    const remoteHash = hashFile(path.join(remoteDir, rel));
    if (localHash === remoteHash) diff.unchanged.push(rel);
    else diff.modified.push(rel);
  }
  for (const rel of localFiles) {
    if (!remoteFiles.has(rel)) diff.localOnly.push(rel);
  }

  for (const list of Object.values(diff) as string[][]) list.sort();
  return diff;
}

/** 差分があるか（unchanged 以外が 1件でもあるか） */
export function hasDiff(diff: SkillDiff): boolean {
  return diff.modified.length > 0 || diff.added.length > 0 || diff.localOnly.length > 0;
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
