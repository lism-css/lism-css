import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { logger } from './logger.js';
import { t } from './i18n.js';
import { getInvokeCommand } from './invokeCommand.js';

const LEGACY_CONFIG_FILE = 'lism-ui.json';
const CONFIG_SEARCH = ['lism.config.js', 'lism.config.mjs'] as const;

export interface LismCliConfig {
  framework: 'react' | 'astro';
  componentsDir: string;
  helperDir: string;
}

interface LismConfigFile {
  cli?: LismCliConfig;
  // 他のキー（tokens 等）はここでは関心外
  [key: string]: unknown;
}

/** プロジェクトルートから見た設定ファイルの絶対パス */
function resolvePath(filename: string): string {
  return path.resolve(process.cwd(), filename);
}

/** 使用する設定ファイルを検出（存在する最初のもの）。見つからなければ null。 */
export function findConfigFile(): { path: string; filename: string; kind: 'module' | 'legacy-json' } | null {
  for (const name of CONFIG_SEARCH) {
    const abs = resolvePath(name);
    if (fs.existsSync(abs)) return { path: abs, filename: name, kind: 'module' };
  }
  const legacy = resolvePath(LEGACY_CONFIG_FILE);
  if (fs.existsSync(legacy)) return { path: legacy, filename: LEGACY_CONFIG_FILE, kind: 'legacy-json' };
  return null;
}

export function configExists(): boolean {
  return findConfigFile() !== null;
}

/** `lism.config.js` 新規作成時のデフォルトファイル名 */
export const DEFAULT_CONFIG_FILENAME = 'lism.config.js';

/** 新規 lism.config.js のパス */
export function getDefaultConfigPath(): string {
  return resolvePath(DEFAULT_CONFIG_FILENAME);
}

/**
 * CLI 設定を読み込む。
 * - `lism.config.{js,mjs}`: 動的インポート（jiti）で default export から `cli` を取得
 * - `lism-ui.json` (legacy): JSON.parse、deprecation 警告を出す
 */
export async function readConfig(): Promise<LismCliConfig> {
  const found = findConfigFile();
  if (!found) {
    throw new Error(t('config.notFound'));
  }

  if (found.kind === 'legacy-json') {
    logger.warn(t('config.legacyWarning', { filename: LEGACY_CONFIG_FILE, invoke: getInvokeCommand() }));
    const raw = fs.readFileSync(found.path, 'utf-8');
    const parsed = JSON.parse(raw) as LismCliConfig;
    return parsed;
  }

  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const mod = await jiti.import(found.path);

  // `cli` サブキーがあればそれを優先、なければモジュール全体を CLI 設定として扱う（後方互換）
  const cli = (mod as LismConfigFile | undefined)?.cli ?? (mod as LismCliConfig | undefined);
  if (!cli || typeof cli !== 'object') {
    throw new Error(t('config.cliSectionMissing', { filename: found.filename }));
  }
  validateCliConfig(cli);
  return cli;
}

function validateCliConfig(cli: unknown): asserts cli is LismCliConfig {
  const c = cli as Partial<LismCliConfig>;
  if (c.framework !== 'react' && c.framework !== 'astro') {
    throw new Error(t('config.invalidFramework'));
  }
  if (typeof c.componentsDir !== 'string' || !c.componentsDir) {
    throw new Error(t('config.invalidComponentsDir'));
  }
  if (typeof c.helperDir !== 'string' || !c.helperDir) {
    throw new Error(t('config.invalidHelperDir'));
  }
}

/** lism.config.js を新規作成する（既存の場合は書き換えない） */
export function writeFreshConfig(cli: LismCliConfig): string {
  const filePath = getDefaultConfigPath();
  const body = renderConfigTemplate(cli);
  fs.writeFileSync(filePath, body);
  return filePath;
}

/**
 * 指定された lism.config.{js,mjs} に `cli` セクションが存在するかを返す。
 * jiti で実際にモジュールを評価して `default.cli` の有無を判定するため、コメントや
 * 他キー値に含まれる "cli:" で false positive にならない。
 */
export async function hasCliSection(filePath: string): Promise<boolean> {
  try {
    const jiti = createJiti(import.meta.url, { interopDefault: true });
    const mod = await jiti.import(filePath);
    return !!(mod as LismConfigFile | undefined)?.cli;
  } catch (err) {
    throw new Error(t('config.loadFailed', { path: filePath, reason: String(err) }));
  }
}

/**
 * 既存の lism.config.{js,mjs} に `cli` セクションを追記する。
 * - すでに `cli` が含まれ、かつ `options.force` が false（既定）の場合は patched: false を返す
 * - `options.force` が true の場合は既存の `cli` セクションを削除してから追記する
 * - オブジェクトリテラルの挿入位置を特定できない場合も patched: false
 *
 * 対応する記法：
 * - `export default { ... }`
 * - `export default defineConfig({ ... })`（関数呼び出しラッパー）
 * - `export default ({ ... })`（カッコ包み）
 * - `const config = { ... }; export default config;`（変数経由）
 *
 * @param targetPath 対象ファイルの絶対パス。省略時は lism.config.js を対象にする。
 */
export async function patchConfigWithCli(
  cli: LismCliConfig,
  targetPath?: string,
  options: { force?: boolean; existingCli?: boolean } = {}
): Promise<{ path: string; patched: boolean }> {
  const filePath = targetPath ?? getDefaultConfigPath();
  let source = fs.readFileSync(filePath, 'utf-8');

  // 呼び出し側で既に hasCliSection を評価済みならその結果を使い、jiti による再評価を避ける
  const hasExisting = options.existingCli ?? (await hasCliSection(filePath));
  if (hasExisting) {
    if (!options.force) {
      return { path: filePath, patched: false };
    }
    const removed = removeCliSection(source);
    if (removed === null) {
      return { path: filePath, patched: false };
    }
    source = removed;
  }

  const insertAt = findInsertPosition(source);
  if (insertAt === -1) {
    return { path: filePath, patched: false };
  }

  const insertion = `\n  cli: ${renderCliObject(cli, '  ')},`;
  const updated = source.slice(0, insertAt) + insertion + source.slice(insertAt);
  fs.writeFileSync(filePath, updated);
  return { path: filePath, patched: true };
}

/**
 * 既存の `cli: { ... }` セクション（と末尾カンマ）を取り除いた文字列を返す。
 * 文字列リテラル・コメント内の `{` / `}` はバランス計算から除外する。
 * 見つからない、または括弧がアンバランスな場合は null を返す。
 */
function removeCliSection(source: string): string | null {
  // 直前が行頭・カンマ・`{` のいずれかに限定し、"my_cli:" や文字列値との誤マッチを避ける
  const match = source.match(/(^|[\n,{])(\s*)cli\s*:\s*\{/);
  if (!match) return null;
  const sectionStart = match.index! + match[1].length + match[2].length;
  const openBrace = match.index! + match[0].length - 1;

  let i = openBrace + 1;
  let depth = 1;
  while (i < source.length && depth > 0) {
    const c = source[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      i++;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;

  let end = i;
  if (source[end] === ',') end++;
  // セクションの直後に改行だけが残らないよう、末尾の空行を 1 つ吸収
  const trailing = source.slice(end).match(/^[ \t]*\n/);
  if (trailing) end += trailing[0].length;

  return source.slice(0, sectionStart) + source.slice(end);
}

/**
 * `cli` キーを挿入すべきオブジェクトリテラルの `{` 直後の位置を返す。
 * 見つからなければ -1。
 */
function findInsertPosition(source: string): number {
  // パターン1: `export default {` / `export default defineConfig({` / `export default ({`
  // 末尾が必ず `{` になるように構成
  const inline = source.match(/export default\s*(?:[A-Za-z_$][A-Za-z0-9_$]*\s*)?\(?\s*\{/);
  if (inline) {
    return inline.index! + inline[0].length;
  }

  // パターン2: `const config = { ... }; export default config;` のような変数経由
  const varExport = source.match(/export default\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*;?/);
  if (varExport) {
    const varName = varExport[1];
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const decl = source.match(new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*(?:[A-Za-z_$][A-Za-z0-9_$]*\\s*)?\\(?\\s*\\{`));
    if (decl) {
      return decl.index! + decl[0].length;
    }
  }

  return -1;
}

function renderConfigTemplate(cli: LismCliConfig): string {
  return [
    'export default {', //
    `  cli: ${renderCliObject(cli, '  ')},`,
    '};',
    '',
  ].join('\n');
}

function renderCliObject(cli: LismCliConfig, indent: string): string {
  return [
    '{', //
    `${indent}  framework: ${JSON.stringify(cli.framework)},`,
    `${indent}  componentsDir: ${JSON.stringify(cli.componentsDir)},`,
    `${indent}  helperDir: ${JSON.stringify(cli.helperDir)},`,
    `${indent}}`,
  ].join('\n');
}
