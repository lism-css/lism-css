import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { EXCLUDE_COMPONENT_FILES, transformComponentFile, type TransformedFile } from '../../transform.js';

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
  /** キャッシュ無効化（giget の force: true 相当） */
  force?: boolean;
}

export interface RegistryFile {
  path: string;
  content: string;
}

export interface RegistryCatalog {
  version: string;
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

function isExcludedComponentFile(rel: string): boolean {
  // ルート直下の内部エクスポートファイルのみ除外
  if (!rel.includes('/') && EXCLUDE_COMPONENT_FILES.has(rel)) return true;
  // storybook / test ファイルも配信対象外
  if (/(^|\/)[^/]+\.stories\.[a-z]+$/.test(rel)) return true;
  if (/(^|\/)[^/]+\.test\.[a-z]+$/.test(rel)) return true;
  return false;
}

/** カタログ（registry-index.json）を raw GitHub から取得 */
export async function fetchCatalog(options: FetchOptions = {}): Promise<RegistryCatalog> {
  const ref = options.ref ?? DEFAULT_UI_REF;
  const url = `${RAW_BASE}/${REPO}/${ref}/${REGISTRY_INDEX_PATH}`;
  const res = await fetch(url, { cache: options.force ? 'no-store' : 'default' });
  if (!res.ok) {
    throw new Error(`Failed to fetch registry-index.json (${res.status} ${res.statusText}): ${url}`);
  }
  return (await res.json()) as RegistryCatalog;
}

/**
 * 指定コンポーネントを giget で一時ディレクトリに展開 → transform して FileEntry を返す。
 * name は PascalCase（例: 'Accordion', 'NavMenu'）。
 */
export async function fetchComponent(name: string, options: FetchOptions = {}): Promise<RegistryComponent> {
  const ref = options.ref ?? DEFAULT_UI_REF;
  const tmp = makeTmpDir('lism-ui-component-');
  try {
    await downloadTemplate(`github:${REPO}/${COMPONENTS_PATH}/${name}#${ref}`, {
      dir: tmp,
      force: true,
      forceClean: true,
      ...(options.force ? { preferOffline: false } : {}),
    });

    const files = walkFiles(tmp);
    const helperSet = new Set<string>();
    const classified: RegistryComponent['files'] = { shared: [], react: [], astro: [] };

    for (const rel of files) {
      if (isExcludedComponentFile(rel)) continue;
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

/**
 * helper をまとめて giget で取得し、指定名の helper を FileEntry で返す。
 * 複数 helper を連続で取得する場合でも tmpDir は呼び出し毎に作り直す（簡潔さ優先）。
 */
export async function fetchHelper(name: string, options: FetchOptions = {}): Promise<RegistryHelper> {
  const ref = options.ref ?? DEFAULT_UI_REF;
  const tmp = makeTmpDir('lism-ui-helper-');
  try {
    await downloadTemplate(`github:${REPO}/${HELPER_PATH}#${ref}`, {
      dir: tmp,
      force: true,
      forceClean: true,
    });

    const files = walkFiles(tmp);

    // テストファイルは配信対象外
    const candidates = files.filter((f) => !/(^|\/)[^/]+\.test\.[a-z]+$/.test(f));

    // 拡張子を除いたファイル名が name と一致するものが対象
    const matched = candidates.filter((f) => {
      const base = path.basename(f).replace(/\.[^.]+$/, '');
      return base === name;
    });

    if (matched.length === 0) {
      throw new Error(`helper "${name}" が見つかりません（${HELPER_PATH}）`);
    }

    const entries: RegistryFile[] = matched.map((rel) => ({
      path: rel,
      content: fs.readFileSync(path.join(tmp, rel), 'utf-8'),
    }));

    return { name, files: entries };
  } finally {
    cleanupTmpDir(tmp);
  }
}
