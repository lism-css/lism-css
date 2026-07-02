import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { logger } from './logger.js';
import { t } from './i18n.js';
import { getInvokeCommand } from './invokeCommand.js';

const LEGACY_CONFIG_FILE = 'lism-ui.json';
const CONFIG_SEARCH = ['lism.config.ts', 'lism.config.mjs', 'lism.config.js'] as const;

export interface LismCliConfig {
  framework: 'react' | 'astro';
  componentsDir: string;
  helperDir: string;
}

interface LismConfigFile {
  ui?: LismCliConfig;
  /** @deprecated `ui` へリネーム済み。後方互換のための読み取り専用。 */
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
 * UI（旧 CLI）設定を読み込む。
 * - `lism.config.{ts,mjs,js}`: 動的インポート（jiti）で default export から `ui`（フォールバックで旧 `cli`）を取得
 * - `lism-ui.json` (legacy): JSON.parse、deprecation 警告を出す
 *
 * `ui`/`cli` セクションが見つからない場合は `null` を返す（throw しない）。
 * `lism.config.js` が tokens/props 等の CSS カスタマイズ専用に作られていて
 * UI セクションがまだ無いケースで、呼び出し側が対話プロンプトへフォールバックできるようにするため。
 * セクションが存在するが値の形が不正な場合は throw する（ユーザーの入力ミスを黙って無視しない）。
 */
export async function readConfig(): Promise<LismCliConfig | null> {
  const found = findConfigFile();
  if (!found) return null;

  if (found.kind === 'legacy-json') {
    logger.warn(t('config.legacyWarning', { filename: LEGACY_CONFIG_FILE, invoke: getInvokeCommand() }));
    const raw = fs.readFileSync(found.path, 'utf-8');
    const parsed = JSON.parse(raw) as LismCliConfig;
    validateCliConfig(parsed);
    return parsed;
  }

  const jiti = createJiti(import.meta.url, { interopDefault: true });
  let mod: unknown;
  try {
    mod = await jiti.import(found.path);
  } catch (err) {
    throw new Error(t('config.loadFailed', { path: found.path, reason: String(err) }));
  }

  const modObj = mod as LismConfigFile | undefined;
  // `??` だと「ui キーは存在するが値が null 等」のケースで cli/旧形式へ静かにフォールバックしてしまい、
  // 設定ミスが見えなくなる。キーの「存在」自体で判定し、値の妥当性は validateCliConfig に委ねる。
  const hasUiKey = modObj?.ui !== undefined;
  const hasCliKey = modObj?.cli !== undefined;

  if (hasUiKey || hasCliKey) {
    const explicit = hasUiKey ? modObj.ui : modObj.cli;
    if (!hasUiKey && hasCliKey) {
      logger.warn(t('config.cliKeyDeprecated', { filename: found.filename }));
    }
    validateCliConfig(explicit);
    return explicit;
  }

  // 明示キーが無い場合、モジュール全体が直接 UI 設定という旧形式への後方互換を試す。
  // 検証に失敗したら「UI セクションが無い」とみなし null を返す（throw しない）。
  // CSS カスタマイズ専用の lism.config.js（tokens/props 等）を誤って UI 設定と解釈しないため。
  try {
    validateCliConfig(modObj);
    // jiti の interopDefault は default export のプロパティをモジュール名前空間に
    // 合成する Proxy を返すため、そのまま返すと __esModule 等の余計な内部プロパティが
    // 漏れる。必要な3フィールドだけを抜き出してクリーンなオブジェクトを構築する。
    return { framework: modObj.framework, componentsDir: modObj.componentsDir, helperDir: modObj.helperDir };
  } catch {
    return null;
  }
}

function validateCliConfig(cli: unknown): asserts cli is LismCliConfig {
  const c = (cli ?? {}) as Partial<LismCliConfig>;
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

/** lism.config.js を新規作成する。既に存在する場合は呼び出し側のロジック誤りとして throw する。 */
export function writeFreshConfig(cli: LismCliConfig): string {
  const filePath = getDefaultConfigPath();
  if (fs.existsSync(filePath)) {
    throw new Error(t('config.freshConfigExists', { path: filePath }));
  }
  const body = renderConfigTemplate(cli);
  fs.writeFileSync(filePath, body);
  return filePath;
}

function renderConfigTemplate(cli: LismCliConfig): string {
  return [
    'export default {', //
    `  ui: ${renderCliObject(cli, '  ')},`,
    '};',
    '',
  ].join('\n');
}

/** `ui add` / `ui init` で「貼り付け用スニペット」として表示する文字列を返す（`ui:` キーを含む） */
export function renderUiSnippet(cli: LismCliConfig): string {
  return `ui: ${renderCliObject(cli, '')},`;
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
