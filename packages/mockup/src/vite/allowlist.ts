/**
 * ページから import してよい bare specifier の許可リスト。
 *
 * パッケージ名の前方一致では許可しない。`@lism-css/ui` はルート `.` を export しておらず
 * `./react/Accordion` 等の個別エントリしか無いため、前方一致だと「許可済みなのに bundle できない
 * specifier」を生むため。許可リストは各パッケージの `exports` マップから実在 specifier へ展開する。
 *
 * 解決は必ず `@lism-css/mockup` 自身を起点に行う（`import.meta.resolve()`）。
 * `createRequire()` は使えない — `lism-css` / `@lism-css/ui` の対象 exports は `import` 条件のみのため。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getMockPackageRoot, safeRealpath, walkAncestorDirs } from '../core/paths.js';

/** ページからの bare import を許可するパッケージ。 */
export const ALLOWED_PACKAGES = ['react', 'react-dom', 'lism-css', '@lism-css/ui', 'lucide-react'] as const;

/** JSX 変換が注入する runtime（exports にも含まれるが、変換方式が変わっても落ちないよう明示する）。 */
const ALWAYS_ALLOWED = ['react/jsx-runtime', 'react/jsx-dev-runtime'];

interface WildcardPattern {
  prefix: string;
  suffix: string;
}

export interface ImportAllowlist {
  /** 完全一致で許可する specifier（`exports` の静的エントリ）。 */
  readonly specifiers: ReadonlySet<string>;
  /** `server.fs.allow` に渡す、許可パッケージの realpath ルート。 */
  readonly packageRoots: readonly string[];
  /** 見つからなかったパッケージ名（デバッグ・テスト用）。 */
  readonly missingPackages: readonly string[];
  isAllowed(specifier: string): boolean;
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

/** 許可リストを構築する。 */
export function buildImportAllowlist(): ImportAllowlist {
  const from = getMockPackageRoot();
  const specifiers = new Set<string>(ALWAYS_ALLOWED);
  const wildcards: WildcardPattern[] = [];
  const packageRoots: string[] = [];
  const missingPackages: string[] = [];

  for (const pkgName of ALLOWED_PACKAGES) {
    const pkgDir = findPackageDir(pkgName, from);
    if (!pkgDir) {
      missingPackages.push(pkgName);
      continue;
    }
    packageRoots.push(safeRealpath(pkgDir));

    let manifest: Record<string, unknown>;
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8')) as Record<string, unknown>;
    } catch {
      missingPackages.push(pkgName);
      continue;
    }

    const { statics, wildcards: patterns } = collectPackageSpecifiers(pkgName, manifest);
    for (const specifier of statics) specifiers.add(specifier);
    wildcards.push(...patterns);
  }

  const wildcardCache = new Map<string, boolean>();

  return {
    specifiers,
    packageRoots,
    missingPackages,
    isAllowed(specifier: string): boolean {
      if (specifiers.has(specifier)) return true;
      if (!wildcards.some((pattern) => matchesWildcard(pattern, specifier))) return false;

      const cached = wildcardCache.get(specifier);
      if (cached !== undefined) return cached;

      const allowed = resolvesToExistingFile(specifier);
      wildcardCache.set(specifier, allowed);
      return allowed;
    },
  };
}
