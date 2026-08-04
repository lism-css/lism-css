/**
 * データディレクトリと `mockup.config.json` の検証。
 *
 * `dev` / `check` は必ずこのモジュールを通るため、両コマンドの判定が食い違うことはない。
 */
import fs from 'node:fs';
import path from 'node:path';

import { isInsideDir, safeRealpath } from './paths.js';
import { MockupContractError, SCHEMA_VERSION, type MockupConfigFile, type MockupConfigPageMeta } from './types.js';

export const MOCKUP_CONFIG_FILENAME = 'mockup.config.json';

/**
 * `mockup.config.json` の許可トップレベルキー。
 * 未知キーはエラーにして、項目追加が必ず `schemaVersion` の更新を伴うようにする
 * （将来の拡張＝ここへキーを足しつつ SCHEMA_VERSION を上げる、という一本道にする）。
 */
const CONFIG_KEYS = ['schemaVersion', 'title', 'pages'] as const;
const PAGE_META_KEYS = ['label', 'category', 'order'] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unknownKeys(value: Record<string, unknown>, allowed: readonly string[]): string[] {
  return Object.keys(value).filter((key) => !allowed.includes(key));
}

/** `[dir]` 引数を絶対パス（realpath）へ解決する。 */
export function resolveDataDir(dir: string): string {
  const abs = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(abs)) {
    throw new MockupContractError(`Data directory not found: ${abs}`);
  }
  if (!fs.statSync(abs).isDirectory()) {
    throw new MockupContractError(`Data directory is not a directory: ${abs}`);
  }
  return safeRealpath(abs);
}

/** `mockup.config.json` を読み、スキーマを検証して返す。 */
export function readMockConfig(dataDir: string): MockupConfigFile {
  const file = path.join(dataDir, MOCKUP_CONFIG_FILENAME);
  if (!fs.existsSync(file)) {
    throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME} not found. Run \`lism-mockup init\` to scaffold a mockup data directory.`, {
      file,
    });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (error) {
    throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME} is not valid JSON: ${(error as Error).message}`, { file });
  }

  if (!isPlainObject(raw)) {
    throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME} must contain a JSON object.`, { file });
  }

  const extra = unknownKeys(raw, CONFIG_KEYS);
  if (extra.length > 0) {
    throw new MockupContractError(
      `${MOCKUP_CONFIG_FILENAME} has unknown key(s): ${extra.map((key) => `"${key}"`).join(', ')}. Allowed keys: ${CONFIG_KEYS.join(', ')}.`,
      { file }
    );
  }

  if (!Object.hasOwn(raw, 'schemaVersion')) {
    throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME} is missing "schemaVersion". Add \`"schemaVersion": ${SCHEMA_VERSION}\`.`, {
      file,
    });
  }
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    throw new MockupContractError(
      `${MOCKUP_CONFIG_FILENAME} has "schemaVersion": ${JSON.stringify(raw.schemaVersion)}, but this version of @lism-css/mockup only supports ${SCHEMA_VERSION}.`,
      { file }
    );
  }

  if (raw.title !== undefined && typeof raw.title !== 'string') {
    throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME}: "title" must be a string.`, { file });
  }

  const config: MockupConfigFile = { schemaVersion: SCHEMA_VERSION };
  if (typeof raw.title === 'string') config.title = raw.title;
  if (raw.pages !== undefined) config.pages = readPagesMeta(raw.pages, file);

  return config;
}

function readPagesMeta(value: unknown, file: string): Record<string, MockupConfigPageMeta> {
  if (!isPlainObject(value)) {
    throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME}: "pages" must be an object keyed by page id.`, { file });
  }

  // ページ id はユーザー入力なので null プロトタイプの器へ入れる。
  // 素の `{}` だと `pages["__proto__"] = entry` が own key にならず、
  // 実在しないページ id の検証（discoverPages）をすり抜けてしまう。
  const pages = Object.create(null) as Record<string, MockupConfigPageMeta>;
  for (const [pageId, meta] of Object.entries(value)) {
    if (!isPlainObject(meta)) {
      throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME}: "pages.${pageId}" must be an object.`, { file });
    }

    const extra = unknownKeys(meta, PAGE_META_KEYS);
    if (extra.length > 0) {
      throw new MockupContractError(
        `${MOCKUP_CONFIG_FILENAME}: "pages.${pageId}" has unknown key(s): ${extra.map((key) => `"${key}"`).join(', ')}. Allowed keys: ${PAGE_META_KEYS.join(', ')}.`,
        { file }
      );
    }
    if (meta.label !== undefined && typeof meta.label !== 'string') {
      throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME}: "pages.${pageId}.label" must be a string.`, { file });
    }
    if (meta.category !== undefined && typeof meta.category !== 'string') {
      throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME}: "pages.${pageId}.category" must be a string.`, { file });
    }
    if (meta.order !== undefined && (typeof meta.order !== 'number' || !Number.isFinite(meta.order))) {
      throw new MockupContractError(`${MOCKUP_CONFIG_FILENAME}: "pages.${pageId}.order" must be a number.`, { file });
    }

    const entry: MockupConfigPageMeta = {};
    if (typeof meta.label === 'string') entry.label = meta.label;
    if (typeof meta.category === 'string') entry.category = meta.category;
    if (typeof meta.order === 'number') entry.order = meta.order;
    pages[pageId] = entry;
  }
  return pages;
}

/** データディレクトリ配下のパスかどうか（realpath 比較）。 */
export function isInsideDataDir(dataDir: string, target: string): boolean {
  return isInsideDir(dataDir, safeRealpath(target));
}
