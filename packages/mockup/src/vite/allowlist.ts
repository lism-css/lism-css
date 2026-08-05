/**
 * ページから import してよい bare specifier の許可リスト。
 *
 * 許可対象は2種類ある。
 * 1. 標準パッケージ（`STANDARD_PACKAGES`）… 設定不要で常時許可し、`@lism-css/mockup` 同梱の
 *    コピーへ解決する。データディレクトリ側に同名パッケージがあっても CLI 側を使う。
 * 2. 追加パッケージ（`mockup.config.json` の `imports`）… データディレクトリを含む
 *    プロジェクトから解決する。未インストールならコマンド開始時にエラーにする。
 *
 * パッケージ名の前方一致では許可しない。`@lism-css/ui` はルート `.` を export しておらず
 * `./react/Accordion` 等の個別エントリしか無いため、前方一致だと「許可済みなのに bundle できない
 * specifier」を生むため。許可リストは各パッケージの `exports` マップから実在 specifier へ展開する。
 *
 * 標準パッケージの解決は必ず `@lism-css/mockup` 自身を起点に行う（`import.meta.resolve()`）。
 * `createRequire()` は使えない — `lism-css` / `@lism-css/ui` の対象 exports は `import` 条件のみのため。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDataResolveAnchor, MOCKUP_CONFIG_FILENAME } from '../core/data-dir.js';
import { ancestorNodeModules, getMockPackageRoot, getResolveAnchor, isInsideDir, safeRealpath, walkAncestorDirs } from '../core/paths.js';
import { MockupContractError, STANDARD_PACKAGES } from '../core/types.js';

/** JSX 変換が注入する runtime（exports にも含まれるが、変換方式が変わっても落ちないよう明示する）。 */
const ALWAYS_ALLOWED = ['react/jsx-runtime', 'react/jsx-dev-runtime'];

/**
 * `imports` に宣言するだけで（プロジェクト側に未インストールでも）使える CLI 同梱パッケージ。
 * README の「`lucide-react` だけは例外でインストール不要」という契約に対応する。
 * ここに無いパッケージは CLI の依存ツリーにあってもフォールバックさせない
 * （CLI の依存変更でモックアップの成否が変わらないようにするため）。
 */
const BUNDLED_EXTRA_PACKAGES: ReadonlySet<string> = new Set(['lucide-react']);

interface WildcardPattern {
  prefix: string;
  suffix: string;
}

/** 許可 specifier をどこから解決するか。 */
export interface PackageResolution {
  /** パッケージ名。 */
  name: string;
  /** `mockup` = `@lism-css/mockup` 同梱、`data` = データディレクトリ側のプロジェクト。 */
  origin: 'mockup' | 'data';
  /** vite / rollup の `resolve()` に渡す importer。 */
  anchor: string;
}

interface WildcardEntry {
  pattern: WildcardPattern;
  resolution: PackageResolution;
  /**
   * ワイルドカード一致時に実ファイルの存在まで確認するか。
   * `import.meta.resolve()` は `@lism-css/mockup` 起点でしか解決できないため、
   * データディレクトリ側のパッケージは bundler の解決に委ねる（失敗すれば契約エラーになる）。
   */
  verify: boolean;
  /**
   * サブパスの解決先をこのディレクトリ（パッケージルートの realpath）配下に制限する。
   * `exports` の無いパッケージは任意サブパスをファイルパスとして解決するため、
   * シンボリックリンク等でパッケージ外のファイルへ届かないことを realpath で確認する。
   */
  confineDir?: string;
}

export interface ImportAllowlist {
  /** 完全一致で許可する specifier（`exports` の静的エントリ）。 */
  readonly specifiers: ReadonlySet<string>;
  /** `server.fs.allow` に渡す、許可パッケージの realpath ルート。 */
  readonly packageRoots: readonly string[];
  /** `server.fs.allow` に渡す、追加パッケージの依存解決用 node_modules ルート。 */
  readonly dependencyRoots: readonly string[];
  /** 見つからなかった標準パッケージ名（デバッグ・テスト用）。 */
  readonly missingPackages: readonly string[];
  /** 許可パッケージ名（標準＋追加）。エラーメッセージ用。 */
  readonly allowedPackages: readonly string[];
  isAllowed(specifier: string): boolean;
  /** 許可済み specifier の解決情報。許可外なら null。 */
  resolutionFor(specifier: string): PackageResolution | null;
}

export interface ImportAllowlistOptions {
  /** データディレクトリ（追加パッケージの解決起点）。 */
  dataDir: string;
  /** `mockup.config.json` の `imports` で宣言された追加パッケージ。 */
  extraPackages?: readonly string[];
}

/** `from` から親方向へ辿って `node_modules/<pkg>/package.json` を探す（Node の解決と同じ順序）。 */
export function findPackageDir(pkgName: string, from: string): string | null {
  for (const dir of walkAncestorDirs(from)) {
    const manifest = path.join(dir, 'node_modules', ...pkgName.split('/'), 'package.json');
    if (fs.existsSync(manifest)) return path.dirname(manifest);
  }
  return null;
}

/** `exports` オブジェクトがサブパスマップか（条件マップの糖衣ではないか）。 */
function isSubpathMap(exportsField: Record<string, unknown>): boolean {
  const keys = Object.keys(exportsField);
  return keys.length > 0 && keys.every((key) => key.startsWith('.'));
}

/** 1パッケージの `exports` から、完全一致 specifier とワイルドカードパターンを取り出す。 */
export function collectPackageSpecifiers(pkgName: string, manifest: Record<string, unknown>): { statics: string[]; wildcards: WildcardPattern[] } {
  const statics: string[] = [];
  const wildcards: WildcardPattern[] = [];
  const exportsField = manifest.exports;

  // exports 未定義のパッケージ（lucide-react 等）は「実在するファイルへ解決できること」を条件に許可する。
  if (exportsField === undefined || exportsField === null) {
    statics.push(pkgName);
    wildcards.push({ prefix: `${pkgName}/`, suffix: '' });
    return { statics, wildcards };
  }

  if (typeof exportsField === 'string' || Array.isArray(exportsField) || !isSubpathMap(exportsField as Record<string, unknown>)) {
    statics.push(pkgName);
    return { statics, wildcards };
  }

  for (const key of Object.keys(exportsField)) {
    const specifier = key === '.' ? pkgName : key.startsWith('./') ? `${pkgName}${key.slice(1)}` : null;
    if (specifier === null) continue;

    const star = specifier.indexOf('*');
    if (star === -1) {
      statics.push(specifier);
    } else {
      wildcards.push({ prefix: specifier.slice(0, star), suffix: specifier.slice(star + 1) });
    }
  }

  return { statics, wildcards };
}

function matchesWildcard(pattern: WildcardPattern, specifier: string): boolean {
  return (
    specifier.length > pattern.prefix.length + pattern.suffix.length && specifier.startsWith(pattern.prefix) && specifier.endsWith(pattern.suffix)
  );
}

/**
 * `.` / `..` のパスセグメントを含むか。
 *
 * bundler はサブパスをファイルパスとして解決するため、`pkg/../target` は宣言していない
 * 同階層パッケージへ、`pkg/../../outside.js` は node_modules 外のファイルへ届いてしまう。
 * Node の ESM 解決も同種の specifier を Invalid Module Specifier として拒否する。
 */
function hasDotPathSegment(specifier: string): boolean {
  return specifier.split(/[\\/]/).some((segment) => segment === '.' || segment === '..');
}

/** 任意サブパス許可（`confineDir` 付き）で、サブパスの解決先がパッケージルート配下に留まるか。 */
function staysInsideDir(confineDir: string, pattern: WildcardPattern, specifier: string): boolean {
  const subpath = specifier.slice(pattern.prefix.length);
  return isInsideDir(confineDir, safeRealpath(path.resolve(confineDir, subpath)));
}

/**
 * `@lism-css/mockup` 自身を起点に解決でき、かつ実ファイルが存在するか。
 *
 * `import.meta.resolve()` は exports のワイルドカード展開でファイルの存在を確認しないため、
 * 存在チェックまで行って初めて「実在 specifier」と言える。
 */
function resolvesToExistingFile(specifier: string): boolean {
  try {
    const url = import.meta.resolve(specifier);
    if (!url.startsWith('file:')) return false;
    return fs.existsSync(fileURLToPath(url));
  } catch {
    return false;
  }
}

/** 1パッケージ分の manifest を読む。読めなければ null。 */
function readManifest(pkgDir: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** 許可リストを構築する。追加パッケージが解決できない場合は契約エラーを投げる。 */
export function buildImportAllowlist({ dataDir, extraPackages = [] }: ImportAllowlistOptions): ImportAllowlist {
  const mockRoot = getMockPackageRoot();
  const mockAnchor = getResolveAnchor();
  const dataAnchor = getDataResolveAnchor(dataDir);

  const staticSpecifiers = new Map<string, PackageResolution>();
  const wildcards: WildcardEntry[] = [];
  const packageRoots: string[] = [];
  const missingPackages: string[] = [];
  const missingExtraPackages: string[] = [];
  const allowedPackages: string[] = [];
  let hasDataResolvedPackage = false;

  const register = (pkgDir: string, manifest: Record<string, unknown>, resolution: PackageResolution): void => {
    const pkgRoot = safeRealpath(pkgDir);
    packageRoots.push(pkgRoot);
    allowedPackages.push(resolution.name);

    const { statics, wildcards: patterns } = collectPackageSpecifiers(resolution.name, manifest);
    // exports の無いパッケージだけが「任意サブパス」のワイルドカードを持つ（collectPackageSpecifiers 参照）。
    const confineDir = manifest.exports === undefined || manifest.exports === null ? pkgRoot : undefined;
    for (const specifier of statics) staticSpecifiers.set(specifier, resolution);
    for (const pattern of patterns) wildcards.push({ pattern, resolution, verify: resolution.origin === 'mockup', confineDir });
  };

  for (const name of STANDARD_PACKAGES) {
    const pkgDir = findPackageDir(name, mockRoot);
    const manifest = pkgDir === null ? null : readManifest(pkgDir);
    if (pkgDir === null || manifest === null) {
      missingPackages.push(name);
      continue;
    }
    register(pkgDir, manifest, { name, origin: 'mockup', anchor: mockAnchor });
  }

  // JSX runtime は react の exports にも含まれるが、react が見つからない環境でも
  // 「変換が注入した import だけは通る」状態を保つため、パッケージ登録とは別に足す。
  for (const specifier of ALWAYS_ALLOWED) {
    if (!staticSpecifiers.has(specifier)) staticSpecifiers.set(specifier, { name: 'react', origin: 'mockup', anchor: mockAnchor });
  }

  for (const name of extraPackages) {
    // データディレクトリ側を優先する。プロジェクト側に無い場合のフォールバックは、
    // CLI 同梱を契約として保証する BUNDLED_EXTRA_PACKAGES（lucide-react）だけに限り、
    // init 直後（プロジェクト側に未インストール）でもそのまま使えるようにする。
    const dataDirPkg = findPackageDir(name, dataDir);
    const pkgDir = dataDirPkg ?? (BUNDLED_EXTRA_PACKAGES.has(name) ? findPackageDir(name, mockRoot) : null);
    const manifest = pkgDir === null ? null : readManifest(pkgDir);
    if (pkgDir === null || manifest === null) {
      missingExtraPackages.push(name);
      continue;
    }

    const origin = dataDirPkg === null ? 'mockup' : 'data';
    if (origin === 'data') hasDataResolvedPackage = true;
    register(pkgDir, manifest, { name, origin, anchor: origin === 'data' ? dataAnchor : mockAnchor });
  }

  if (missingExtraPackages.length > 0) {
    throw new MockupContractError(
      `${MOCKUP_CONFIG_FILENAME} declares package(s) in "imports" that are not installed: ${missingExtraPackages.map((name) => `"${name}"`).join(', ')}. ` +
        `Install them in the project that contains this data directory (for example \`npm install ${missingExtraPackages.join(' ')}\`), or remove them from "imports".`,
      { file: path.join(dataDir, MOCKUP_CONFIG_FILENAME) }
    );
  }

  // 追加パッケージ自身の依存も bundle 対象になるため、データディレクトリ側の
  // node_modules も fs.allow に載せる（許可パッケージのルートだけでは依存を辿れない）。
  const dependencyRoots = hasDataResolvedPackage ? ancestorNodeModules(dataDir) : [];

  const wildcardCache = new Map<string, PackageResolution | null>();

  const resolutionFor = (specifier: string): PackageResolution | null => {
    // `pkg/../target` のような specifier は静的エントリに存在せず、ワイルドカードに
    // 通すとパッケージ外へ解決されうるため、照合前に一律拒否する。
    if (hasDotPathSegment(specifier)) return null;

    const exact = staticSpecifiers.get(specifier);
    if (exact) return exact;

    const cached = wildcardCache.get(specifier);
    if (cached !== undefined) return cached;

    let match: PackageResolution | null = null;
    for (const entry of wildcards) {
      if (!matchesWildcard(entry.pattern, specifier)) continue;
      if (entry.confineDir !== undefined && !staysInsideDir(entry.confineDir, entry.pattern, specifier)) continue;
      if (entry.verify && !resolvesToExistingFile(specifier)) continue;
      match = entry.resolution;
      break;
    }
    wildcardCache.set(specifier, match);
    return match;
  };

  return {
    specifiers: new Set(staticSpecifiers.keys()),
    packageRoots,
    dependencyRoots,
    missingPackages,
    allowedPackages,
    resolutionFor,
    isAllowed(specifier: string): boolean {
      return resolutionFor(specifier) !== null;
    },
  };
}
