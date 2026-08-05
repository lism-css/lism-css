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
 * 標準パッケージの bare import を「@lism-css/mockup 自身の位置」から解決するための importer パス。
 * データディレクトリ側の node_modules を参照させないためのアンカー。
 *
 * アンカーには必ず実在ファイルを使う。vite は存在しない importer を渡されると解決の起点を
 * `root` へフォールバックするため、実在しないパスだと「どこを起点にするか」を指定できない。
 */
export function getResolveAnchor(): string {
  return path.join(getMockPackageRoot(), 'package.json');
}

/**
 * `from` 自身から filesystem のルートまで、親方向へ1階層ずつ辿る。
 *
 * Node のパッケージ解決と同じ「近い順」。node_modules 探索がこの順序に依存するため、
 * 遡り方は複数箇所で書き写さずここ1箇所に置く。
 */
export function* walkAncestorDirs(from: string): Generator<string> {
  let dir = path.resolve(from);
  for (;;) {
    yield dir;
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
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

/**
 * パスに `node_modules` セグメントが含まれるか。
 *
 * データディレクトリからの相対パスを渡すこと。データディレクトリ自身のパスに
 * `node_modules` が含まれる場合まで巻き込まないようにするため。
 */
export function hasNodeModulesSegment(relativePath: string): boolean {
  return relativePath.split(/[\\/]/).includes('node_modules');
}

/** `from` から親方向へ辿って見つかる node_modules ディレクトリ（realpath、近い順）。 */
export function ancestorNodeModules(from: string): string[] {
  const found: string[] = [];
  for (const dir of walkAncestorDirs(from)) {
    const candidate = path.join(dir, 'node_modules');
    if (fs.existsSync(candidate)) found.push(safeRealpath(candidate));
  }
  return found;
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
