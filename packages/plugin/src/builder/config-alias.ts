/**
 * 「`lism-css/config.js` を user の lism.config へ alias する」ための bundler 非依存コア。
 *
 * コンポーネント側ランタイム（`lism-css` の `config/index.ts`）が import する `lism-css/config.js` を
 * user 設定へ差し替えることで、JS ランタイムが user の breakpoints / props / traits を読む。
 * Vite（`resolve.alias`）・Turbopack（`resolveAlias`）・webpack（`resolve.alias`）のいずれも、
 * この「対象 id」と「差し替え先 user config の絶対パス」だけ分かれば alias を組めるため、両者をここへ集約する。
 */
import path from 'node:path';

import { findUserConfigPath } from './load-config';
import { normalizePath } from './normalize-path';

/** 差し替え対象となる bare specifier（コンポーネント側が import する config）。 */
export const CONFIG_TARGET_ID = 'lism-css/config.js';

/**
 * alias の差し替え先となる user lism.config の絶対パス（posix 正規化済み）を返す。
 *
 * - 見つからなければ null。
 * - `configPath` を明示したのに存在しない場合だけエラーログを出す（暗黙探索の未ヒットは無音）。
 */
export function resolveConfigAliasPath(projectRoot: string, configPath?: string): string | null {
  const found = findUserConfigPath(projectRoot, configPath);
  if (found) return normalizePath(found);

  if (configPath) {
    console.error(`[lism-css] 指定された設定ファイルが存在しません: ${path.resolve(projectRoot, configPath)}`);
  }
  return null;
}
