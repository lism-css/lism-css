/**
 * パス関連の共有ヘルパー。
 *
 * `src/` から実行される vitest と `dist/` から実行される CLI のどちらでも同じ場所を指せるよう、
 * パッケージルートの解決は「このファイルの2階層上」に固定している（`src/core/` と `dist/core/` は同じ深さ）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** `@lism-css/mockup` パッケージのルート絶対パス。 */
export function getMockPackageRoot(): string {
  return path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
}

/** 同梱ビューア（vite root）のディレクトリ。 */
export function getViewerDir(): string {
  return path.join(getMockPackageRoot(), 'viewer');
}

/**
 * 許可 bare import を「@lism-css/mockup 自身の位置」から解決するための importer パス。
 *
 * 実ファイルである必要はない（Vite / Rollup は importer の dirname だけを見る）。
 * データディレクトリ側の node_modules を参照させないためのアンカー。
 */
export function getResolveAnchor(): string {
  return path.join(getMockPackageRoot(), '__lism-mockup-resolve-anchor.js');
}

/** realpath 解決。解決できないパス（仮想 id・未作成ファイル）はそのまま返す。 */
export function safeRealpath(target: string): string {
  try {
    return fs.realpathSync(target);
  } catch {
    return path.resolve(target);
  }
}

/** `target` が `dir` 配下（または `dir` 自身）かどうか。 */
export function isInsideDir(dir: string, target: string): boolean {
  const rel = path.relative(dir, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** `?raw` などのクエリを除いたパス部分。 */
export function stripQuery(id: string): string {
  const index = id.search(/[?#]/);
  return index === -1 ? id : id.slice(0, index);
}

/** id をパス部分とクエリ部分（`?...`）に分割する。 */
export function splitQuery(id: string): { pathname: string; query: string } {
  const index = id.search(/[?#]/);
  return index === -1 ? { pathname: id, query: '' } : { pathname: id.slice(0, index), query: id.slice(index) };
}

/**
 * import 指定子として使える posix 絶対パスへ変換する（Windows の `C:\x` → `/C:/x`）。
 * 仮想モジュールが生成する動的 import と、境界チェックの照合の双方で使う。
 */
export function toImportSpecifier(file: string): string {
  const posix = file.replace(/\\/g, '/');
  return posix.startsWith('/') ? posix : `/${posix}`;
}
