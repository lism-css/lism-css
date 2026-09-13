/**
 * check / dev が os.tmpdir() に作る共有ディレクトリ（cacheDir / configDir）の後片付け。
 *
 * これらは起動間で使い回すため runtime.cleanup() では消えない。テストが作った分だけ、
 * キーを同じ入力（データディレクトリ・imports）から再現して削除する。
 */
import fs from 'node:fs';
import path from 'node:path';

import { resolveGeneratedConfigDir, resolveViteCacheDir } from '../core/runtime.js';

const checkedDirs: string[] = [];

/** check / dev を実行するデータディレクトリを覚えておく（`cleanupSharedDirs()` で片付ける）。 */
export function trackCheckedDir(dir: string): string {
  checkedDirs.push(dir);
  return dir;
}

/** データディレクトリの `imports`（共有ディレクトリのキーの一部）。読めなければ空扱い。 */
function readImports(dir: string): string[] {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, 'mockup.config.json'), 'utf-8')) as { imports?: string[] };
    return Array.isArray(raw.imports) ? raw.imports : [];
  } catch {
    return [];
  }
}

/** 覚えておいたデータディレクトリ由来の共有ディレクトリをすべて削除する。 */
export function cleanupSharedDirs(): void {
  while (checkedDirs.length > 0) {
    const dir = checkedDirs.pop();
    if (!dir || !fs.existsSync(dir)) continue;
    const real = fs.realpathSync(dir);
    const imports = readImports(real);
    for (const shared of [resolveViteCacheDir(real, imports), resolveGeneratedConfigDir(real, imports)]) {
      fs.rmSync(shared, { recursive: true, force: true });
    }
  }
}
