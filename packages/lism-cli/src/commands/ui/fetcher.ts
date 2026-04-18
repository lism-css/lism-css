import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { transformComponentFile } from '../../transform.js';

/** giget で取得するリポジトリ（owner/repo）。 */
const REPO = 'lism-css/lism-css';

/**
 * デフォルトの ref。
 * FIXME(dev マージ前): 'dev' に戻すこと。現状は本ブランチ (#292) の beta publish 検証用。
 */
export const DEFAULT_UI_REF = 'fix/292-giget-registry-migration';

/** raw GitHub で registry-index.json を fetch する際のベース URL */
const RAW_BASE = 'https://raw.githubusercontent.com';

/** コンポーネント / helper のリポジトリ内パス */
const COMPONENTS_PATH = 'packages/lism-ui/src/components';
const HELPER_PATH = 'packages/lism-ui/src/helper';
const REGISTRY_INDEX_PATH = 'packages/lism-ui/registry-index.json';

export interface FetchOptions {
  ref?: string;
}

export interface RegistryFile {
  path: string;
  content: string;
}

export interface RegistryCatalog {
  version: string;
  /** コンポーネントディレクトリ直下で配信対象から除外するファイル名一覧（lism-ui 側がカタログに同梱） */
  excludeComponentFiles: string[];
  components: Array<{ name: string; helpers: string[] }>;
  helpers: string[];
}

export interface RegistryComponent {
  name: string;
  helpers: string[];
  files: {
    shared: RegistryFile[];
    react: RegistryFile[];
    astro: RegistryFile[];
  };
}

export interface RegistryHelper {
  name: string;
  files: RegistryFile[];
}

/** ディレクトリ配下のファイルを再帰走査し、POSIX 形式の相対パス一覧を返す */
function walkFiles(root: string): string[] {
  const results: string[] = [];
  const stack: string[] = [''];
  while (stack.length > 0) {
    const rel = stack.pop()!;
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const childRel = rel ? path.join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) stack.push(childRel);
      else if (entry.isFile()) results.push(childRel.split(path.sep).join('/'));
    }
  }
  return results;
}

function makeTmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanupTmpDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // noop
  }
}

function isExcludedComponentFile(rel: string, excludeRootFiles: ReadonlySet<string>): boolean {
  // ルート直下の内部エクスポートファイルのみ除外
  if (!rel.includes('/') && excludeRootFiles.has(rel)) return true;
  // storybook / test ファイルも配信対象外
  if (/(^|\/)[^/]+\.stories\.[a-z]+$/.test(rel)) return true;
  if (/(^|\/)[^/]+\.test\.[a-z]+$/.test(rel)) return true;
  return false;
}

/** カタログ（registry-index.json）を raw GitHub から取得 */
export async function fetchCatalog(options: FetchOptions = {}): Promise<RegistryCatalog> {
  const ref = options.ref ?? DEFAULT_UI_REF;
  const url = `${RAW_BASE}/${REPO}/${ref}/${REGISTRY_INDEX_PATH}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry-index.json (${res.status} ${res.statusText}): ${url}`);
  }
  return (await res.json()) as RegistryCatalog;
}

/**
 * 指定コンポーネントを giget で一時ディレクトリに展開 → transform して FileEntry を返す。
 * name は PascalCase（例: 'Accordion', 'NavMenu'）。
 * excludeRootFiles はカタログ (registry-index.json) の excludeComponentFiles から渡す。
 */
export async function fetchComponent(name: string, excludeRootFiles: ReadonlySet<string>, options: FetchOptions = {}): Promise<RegistryComponent> {
  const ref = options.ref ?? DEFAULT_UI_REF;
  const tmp = makeTmpDir('lism-ui-component-');
  try {
    await downloadTemplate(`github:${REPO}/${COMPONENTS_PATH}/${name}#${ref}`, {
      dir: tmp,
      force: true,
      forceClean: true,
    });

    const files = walkFiles(tmp);
    const helperSet = new Set<string>();
    const classified: RegistryComponent['files'] = { shared: [], react: [], astro: [] };

    for (const rel of files) {
      if (isExcludedComponentFile(rel, excludeRootFiles)) continue;
      const raw = fs.readFileSync(path.join(tmp, rel), 'utf-8');
      const { file, helpers } = transformComponentFile(rel, raw);
      for (const h of helpers) helperSet.add(h);
      classified[file.category].push({ path: file.path, content: file.content });
    }

    return {
      name,
      helpers: [...helperSet].sort(),
      files: classified,
    };
  } finally {
    cleanupTmpDir(tmp);
  }
}

interface HelperTree {
  /** helper 名 → 関連ファイル一覧（拡張子違いで複数 ex: helper.js + helper.d.ts） */
  byName: Map<string, RegistryFile[]>;
}

/**
 * helper tree（src/helper 配下の全ファイル）を ref ごとに 1 度だけ取得して共有するキャッシュ。
 * 同一プロセス内で fetchHelper が複数回呼ばれても tarball ダウンロードは ref あたり 1 回に抑える。
 *
 * 並列呼び出しに対応するため Promise を保持する（in-flight も共有）。
 */
const helperTreeCache = new Map<string, Promise<HelperTree>>();

async function loadHelperTree(ref: string): Promise<HelperTree> {
  const cached = helperTreeCache.get(ref);
  if (cached) return cached;

  const promise = (async (): Promise<HelperTree> => {
    const tmp = makeTmpDir('lism-ui-helper-');
    try {
      await downloadTemplate(`github:${REPO}/${HELPER_PATH}#${ref}`, {
        dir: tmp,
        force: true,
        forceClean: true,
      });

      const byName = new Map<string, RegistryFile[]>();
      for (const rel of walkFiles(tmp)) {
        if (/(^|\/)[^/]+\.test\.[a-z]+$/.test(rel)) continue;
        const base = path.basename(rel).replace(/\.[^.]+$/, '');
        const entry: RegistryFile = { path: rel, content: fs.readFileSync(path.join(tmp, rel), 'utf-8') };
        const list = byName.get(base);
        if (list) list.push(entry);
        else byName.set(base, [entry]);
      }

      return { byName };
    } finally {
      cleanupTmpDir(tmp);
    }
  })();

  helperTreeCache.set(ref, promise);
  // 失敗したらキャッシュから外して次回再試行可能にする
  promise.catch(() => helperTreeCache.delete(ref));

  return promise;
}

/**
 * 共有キャッシュから指定名の helper を取り出す。
 * 同一 ref への複数 helper 取得は内部的に tarball 1 回のみ。
 */
export async function fetchHelper(name: string, options: FetchOptions = {}): Promise<RegistryHelper> {
  const ref = options.ref ?? DEFAULT_UI_REF;
  const tree = await loadHelperTree(ref);
  const files = tree.byName.get(name);
  if (!files || files.length === 0) {
    throw new Error(`helper "${name}" が見つかりません（${HELPER_PATH}）`);
  }
  return { name, files };
}
