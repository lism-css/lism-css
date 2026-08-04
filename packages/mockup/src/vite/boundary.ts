/**
 * import 境界の強制。
 *
 * `server.fs.allow` は「許可済みファイルから import されたファイル」を allow 外でも扱えるため、
 * 単独では境界を保証できない。そこで `resolveId` で importer（誰が import しているか）を分類して規則を適用する。
 * このプラグインは `dev` と `check` の両方に適用する。
 *
 * 1. 信頼済みコード（`virtual:lism-mockup/pages`）からのページ import … 列挙結果に含まれることを検証して許可
 * 2. ユーザーファイル（realpath がデータディレクトリ配下）からの import … 許可リストの bare import と、
 *    データディレクトリ内で完結する相対 import のみ。絶対パス・`/@fs/`・許可外 bare は契約違反として拒否
 * 3. それ以外（ビューア自身のコード・vite 内部モジュール） … 通常解決
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

import { getResolveAnchor, isInsideDir, safeRealpath, splitQuery, toImportSpecifier } from '../core/paths.js';
import { MockupContractError } from '../core/types.js';
import { ALLOWED_PACKAGES, type ImportAllowlist } from './allowlist.js';
import { isPageImporterId } from './virtual-modules.js';

/** 相対 import で許可する拡張子。 */
export const RELATIVE_IMPORT_EXTENSIONS = ['.jsx', '.tsx', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] as const;

/** 拡張子省略の相対 import を解決するときに試す候補。 */
const IMPLICIT_EXTENSIONS = ['.jsx', '.tsx'] as const;
const IMPLICIT_INDEX_FILES = ['/index.jsx', '/index.tsx'] as const;

/** vite が dev で使う「root 外ファイル」プレフィックス。ユーザーファイルからの直書きは拒否する。 */
const FS_PREFIX = '/@fs/';
/** `http:` `data:` などの外部 URL 判定（`virtual:` は先に処理済み）。 */
const EXTERNAL_URL_RE = /^[a-z][a-z0-9+.-]*:/i;

export interface ImportBoundaryContext {
  /** データディレクトリ（realpath）。 */
  dataDir: string;
  /** 仮想モジュールが生成した import 指定子の集合。 */
  getPageSpecifiers: () => ReadonlySet<string>;
  allowlist: ImportAllowlist;
}

export type ImportDecision =
  /** 通常解決に任せる。 */
  | { kind: 'passthrough' }
  /** 検証済みの絶対パスへ解決する。 */
  | { kind: 'resolved'; id: string }
  /** 許可された bare import（`@lism-css/mockup` 起点で解決する）。 */
  | { kind: 'bare'; specifier: string };

/**
 * vite / プラグインが注入する内部モジュールか。
 *
 * `\0`（rollup の仮想 id）・`virtual:`・`/@react-refresh` や `/@vite/client` などの内部名前空間。
 * `/@fs/` だけは「root 外ファイルへの直アクセス」なので内部扱いにしない。
 */
function isViteInternalId(pathname: string): boolean {
  if (pathname.startsWith('\0') || pathname.startsWith('virtual:')) return true;
  return pathname.startsWith('/@') && !pathname.startsWith(FS_PREFIX);
}

function violation(dataDir: string, importerFile: string, source: string, reason: string): MockupContractError {
  const where = isInsideDir(dataDir, importerFile) ? path.relative(dataDir, importerFile) : importerFile;
  return new MockupContractError(`Forbidden import ${JSON.stringify(source)} in ${where}: ${reason}`, { file: importerFile });
}

/** 拡張子省略にも対応して相対 import 先の実ファイルを探す。 */
function resolveRelativeTarget(target: string): string | null {
  const ext = path.extname(target);
  if (ext !== '') return fs.existsSync(target) ? target : null;

  for (const candidate of [...IMPLICIT_EXTENSIONS.map((e) => target + e), ...IMPLICIT_INDEX_FILES.map((e) => target + e)]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** import 1件を分類する。契約違反は `MockupContractError` を投げる。 */
export function classifyImport(source: string, importer: string | undefined, ctx: ImportBoundaryContext): ImportDecision {
  if (!importer) return { kind: 'passthrough' };

  const { pathname: importerFile } = splitQuery(importer);

  // 1. 信頼済み: 列挙結果から生成したページ import
  if (isPageImporterId(importerFile)) {
    const target = splitQuery(source).pathname;
    // build 時の `\0vite/preload-helper.js` 等、vite 自身が注入するモジュールは対象外。
    if (isViteInternalId(target)) return { kind: 'passthrough' };
    if (ctx.getPageSpecifiers().has(toImportSpecifier(target))) return { kind: 'passthrough' };
    throw new MockupContractError(`Unexpected import ${JSON.stringify(source)} from the generated page list.`);
  }

  // 2. ユーザーファイル判定は realpath で行う（シンボリックリンク経由の抜けを作らない）。
  const realImporter = safeRealpath(importerFile);
  if (!isInsideDir(ctx.dataDir, realImporter)) return { kind: 'passthrough' };

  const { pathname, query } = splitQuery(source);

  // vite / plugin が注入する内部モジュール（`/@react-refresh`・`/@vite/client`・仮想モジュール）は誤拒否しない。
  if (pathname.startsWith(FS_PREFIX)) {
    throw violation(ctx.dataDir, realImporter, source, `"${FS_PREFIX}" paths are not allowed. Use a relative path inside the data directory.`);
  }
  if (isViteInternalId(pathname)) return { kind: 'passthrough' };

  if (pathname === '.' || pathname === '..' || pathname.startsWith('./') || pathname.startsWith('../')) {
    return resolveUserRelativeImport(source, pathname, query, realImporter, ctx);
  }

  if (path.isAbsolute(pathname)) {
    throw violation(ctx.dataDir, realImporter, source, 'absolute paths are not allowed. Use a relative path inside the data directory.');
  }
  if (EXTERNAL_URL_RE.test(pathname)) {
    throw violation(ctx.dataDir, realImporter, source, 'external URLs cannot be imported.');
  }

  if (!ctx.allowlist.isAllowed(pathname)) {
    throw violation(
      ctx.dataDir,
      realImporter,
      source,
      `it is not an allowed package entry. Only published entries of ${ALLOWED_PACKAGES.join(', ')} can be imported.`
    );
  }
  return { kind: 'bare', specifier: source };
}

function resolveUserRelativeImport(
  source: string,
  pathname: string,
  query: string,
  importerFile: string,
  ctx: ImportBoundaryContext
): ImportDecision {
  const requested = path.resolve(path.dirname(importerFile), pathname);
  const ext = path.extname(requested);

  if (ext !== '' && !(RELATIVE_IMPORT_EXTENSIONS as readonly string[]).includes(ext)) {
    throw violation(ctx.dataDir, importerFile, source, `only ${RELATIVE_IMPORT_EXTENSIONS.join(', ')} files can be imported with a relative path.`);
  }

  const target = resolveRelativeTarget(requested);
  if (!target) {
    throw violation(ctx.dataDir, importerFile, source, `file not found (${requested}).`);
  }

  const real = safeRealpath(target);
  if (!isInsideDir(ctx.dataDir, real)) {
    throw violation(ctx.dataDir, importerFile, source, `it resolves outside the data directory (${real}).`);
  }

  return { kind: 'resolved', id: real + query };
}

export interface ImportBoundaryOptions extends ImportBoundaryContext {
  /** 許可 bare import を解決するときの importer（既定は `@lism-css/mockup` パッケージルート）。 */
  resolveAnchor?: string;
}

/** import 境界を強制する vite プラグイン。 */
export function importBoundaryPlugin(options: ImportBoundaryOptions): Plugin {
  const { resolveAnchor, ...ctx } = options;
  const anchor = resolveAnchor ?? getResolveAnchor();

  return {
    name: 'lism-mockup:import-boundary',
    enforce: 'pre',

    async resolveId(source, importer) {
      const decision = classifyImport(source, importer, ctx);
      if (decision.kind === 'passthrough') return null;
      if (decision.kind === 'resolved') return decision.id;

      // 許可 bare import は `@lism-css/mockup` 自身の位置から解決する。
      // データディレクトリ側（や、その親）に同名パッケージがあっても CLI 同梱側を使うため。
      const resolved = await this.resolve(decision.specifier, anchor, { skipSelf: true });
      if (!resolved) {
        throw new MockupContractError(
          `Cannot resolve ${JSON.stringify(decision.specifier)} from @lism-css/mockup. Reinstall @lism-css/mockup and try again.`,
          { file: importer }
        );
      }
      return resolved;
    },
  };
}
