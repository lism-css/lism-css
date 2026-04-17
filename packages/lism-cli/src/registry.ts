const DEFAULT_REGISTRY_BASE_URL = 'https://cli.lism-css.com/r';
const REGISTRY_BASE_URL = process.env.LISM_REGISTRY_BASE_URL || DEFAULT_REGISTRY_BASE_URL;

export interface RegistryFile {
  path: string;
  content: string;
}

export interface RegistryCatalog {
  version: string;
  components: Array<{
    name: string;
    description: string;
    helpers: string[];
  }>;
  helpers: string[];
}

export interface RegistryComponent {
  name: string;
  version: string;
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

async function fetchJson<T>(url: string): Promise<T> {
  // file:// スキームはローカル検証用に直接ファイルを読む
  if (url.startsWith('file://')) {
    const { fileURLToPath } = await import('node:url');
    const { readFile } = await import('node:fs/promises');
    const path = fileURLToPath(url);
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as T;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** カタログ（コンポーネント一覧）を取得 */
export async function fetchCatalog(): Promise<RegistryCatalog> {
  return fetchJson<RegistryCatalog>(`${REGISTRY_BASE_URL}/index.json`);
}

/** 個別コンポーネントの JSON を取得 */
export async function fetchComponent(name: string): Promise<RegistryComponent> {
  return fetchJson<RegistryComponent>(`${REGISTRY_BASE_URL}/${name}.json`);
}

/** helper の JSON を取得 */
export async function fetchHelper(name: string): Promise<RegistryHelper> {
  return fetchJson<RegistryHelper>(`${REGISTRY_BASE_URL}/_helpers/${name}.json`);
}
