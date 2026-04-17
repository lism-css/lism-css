import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { logger } from './logger.js';

const LEGACY_CONFIG_FILE = 'lism-ui.json';
const CONFIG_SEARCH = ['lism.config.ts', 'lism.config.mjs', 'lism.config.js'] as const;

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
 * - `lism.config.{ts,mjs,js}`: 動的インポート（jiti）で default export から `cli` を取得
 * - `lism-ui.json` (legacy): JSON.parse、deprecation 警告を出す
 */
export async function readConfig(): Promise<LismCliConfig> {
  const found = findConfigFile();
  if (!found) {
    throw new Error('lism.config.js / lism.config.mjs / lism.config.ts / lism-ui.json のいずれも見つかりません。');
  }

  if (found.kind === 'legacy-json') {
    logger.warn(`[deprecated] ${LEGACY_CONFIG_FILE} は廃止予定です。"lism ui init" で lism.config.js へ移行してください。`);
    const raw = fs.readFileSync(found.path, 'utf-8');
    const parsed = JSON.parse(raw) as LismCliConfig;
    return parsed;
  }

  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const mod = await jiti.import(found.path);

  // `cli` サブキーがあればそれを優先、なければモジュール全体を CLI 設定として扱う（後方互換）
  const cli = (mod as LismConfigFile | undefined)?.cli ?? (mod as LismCliConfig | undefined);
  if (!cli || typeof cli !== 'object') {
    throw new Error(`${found.filename} から CLI 設定（cli キー）を読み込めませんでした。`);
  }
  validateCliConfig(cli);
  return cli;
}

function validateCliConfig(cli: unknown): asserts cli is LismCliConfig {
  const c = cli as Partial<LismCliConfig>;
  if (c.framework !== 'react' && c.framework !== 'astro') {
    throw new Error(`cli.framework は "react" または "astro" を指定してください。`);
  }
  if (typeof c.componentsDir !== 'string' || !c.componentsDir) {
    throw new Error('cli.componentsDir は文字列で指定してください。');
  }
  if (typeof c.helperDir !== 'string' || !c.helperDir) {
    throw new Error('cli.helperDir は文字列で指定してください。');
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
 * 既存の lism.config.js に `cli` セクションを追記する。
 * - すでに `cli` が含まれる場合は false を返し、呼び出し側で案内
 * - `export default {` が見つからない場合も false
 *
 * `cli` 存在判定は jiti でモジュールを実際に評価して `default.cli` の有無で行う
 * （コメントや他キー値に含まれる "cli:" で false positive を起こさないため）。
 */
export async function patchConfigWithCli(cli: LismCliConfig): Promise<{ path: string; patched: boolean }> {
  const filePath = getDefaultConfigPath();
  const original = fs.readFileSync(filePath, 'utf-8');

  let hasCliKey = false;
  try {
    const jiti = createJiti(import.meta.url, { interopDefault: true });
    const mod = await jiti.import(filePath);
    hasCliKey = !!mod?.cli;
  } catch (err) {
    throw new Error(`${filePath} を読み込めませんでした（構文エラー等）。修正してから再実行してください: ${String(err)}`);
  }
  if (hasCliKey) {
    return { path: filePath, patched: false };
  }

  const match = original.match(/export default\s*\{/);
  if (!match) {
    return { path: filePath, patched: false };
  }
  const insertAt = match.index! + match[0].length;
  const insertion = `\n  cli: ${renderCliObject(cli, '  ')},`;
  const updated = original.slice(0, insertAt) + insertion + original.slice(insertAt);
  fs.writeFileSync(filePath, updated);
  return { path: filePath, patched: true };
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
