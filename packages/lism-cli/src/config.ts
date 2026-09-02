import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { logger } from './logger.js';
import { t } from './i18n.js';

const CONFIG_SEARCH = ['lism.config.ts', 'lism.config.mjs', 'lism.config.js'] as const;

export interface LismCliConfig {
  framework: 'react' | 'astro';
  /** UI コンポーネントの出力先。helper は常に `{dir}/_helper` に固定 */
  dir: string;
}

/** config ファイル上の ui セクションの生の形（検証・正規化前） */
interface RawUiConfig {
  framework?: unknown;
  dir?: unknown;
  /** @deprecated 旧キー。`dir` が無い場合のみ読む後方互換。 */
  componentsDir?: unknown;
}

interface LismConfigFile {
  ui?: RawUiConfig;
  /** @deprecated `ui` へリネーム済み。後方互換のための読み取り専用。 */
  cli?: RawUiConfig;
  [key: string]: unknown;
}

function resolvePath(filename: string): string {
  return path.resolve(process.cwd(), filename);
}

export function findConfigFile(): { path: string; filename: string } | null {
  for (const name of CONFIG_SEARCH) {
    const abs = resolvePath(name);
    if (fs.existsSync(abs)) return { path: abs, filename: name };
  }
  return null;
}

export function configExists(): boolean {
  return findConfigFile() !== null;
}

export const DEFAULT_CONFIG_FILENAME = 'lism.config.js';

export function getDefaultConfigPath(): string {
  return resolvePath(DEFAULT_CONFIG_FILENAME);
}

/**
 * UI（旧 CLI）設定を読み込む。
 * `lism.config.{ts,mjs,js}` を動的インポート（jiti）し、default export から `ui`（フォールバックで旧 `cli`）を取得する。
 *
 * `ui`/`cli` セクションが見つからない場合は `null` を返す（throw しない）。
 * `lism.config.js` が tokens/props 等の CSS カスタマイズ専用に作られていて
 * UI セクションがまだ無いケースで、呼び出し側が対話プロンプトへフォールバックできるようにするため。
 * セクションが存在するが値の形が不正な場合は throw する（ユーザーの入力ミスを黙って無視しない）。
 */
export async function readConfig(): Promise<LismCliConfig | null> {
  const found = findConfigFile();
  if (!found) return null;

  const jiti = createJiti(import.meta.url, { interopDefault: true });
  let mod: unknown;
  try {
    mod = await jiti.import(found.path);
  } catch (err) {
    throw new Error(t('config.loadFailed', { path: found.path, reason: String(err) }));
  }

  const modObj = mod as LismConfigFile | undefined;
  // `??` だと「ui キーは存在するが値が null 等」のケースで cli/旧形式へ静かにフォールバックしてしまい、
  // 設定ミスが見えなくなる。キーの「存在」自体で判定し、値の妥当性は normalizeUiConfig に委ねる。
  const hasUiKey = modObj?.ui !== undefined;
  const hasCliKey = modObj?.cli !== undefined;

  if (hasUiKey || hasCliKey) {
    if (!hasUiKey && hasCliKey) {
      logger.warn(t('config.cliKeyDeprecated', { filename: found.filename }));
    }
    return normalizeUiConfig(hasUiKey ? modObj.ui : modObj.cli);
  }

  // 明示キーがない場合は旧形式を検証し、CSS専用設定などUI設定でなければnullを返す。
  try {
    return normalizeUiConfig(modObj);
  } catch {
    return null;
  }
}

/**
 * ui設定を検証・正規化する。必要フィールドだけを抜き出すのは、jitiのinteropDefaultが__esModule等の
 * 内部プロパティを合成した Proxy を返すケースがあるため。
 */
function normalizeUiConfig(raw: unknown): LismCliConfig {
  const c = (raw ?? {}) as RawUiConfig;
  if (c.framework !== 'react' && c.framework !== 'astro') {
    throw new Error(t('config.invalidFramework'));
  }
  const dir = c.dir !== undefined ? c.dir : c.componentsDir;
  if (typeof dir !== 'string' || !dir) {
    throw new Error(t('config.invalidDir'));
  }
  return { framework: c.framework, dir };
}

/**
 * lism.config.js を新規作成する（`init` コマンド用）。
 * core 設定（tokens/props 等）はコメントアウトのひな形として出力し、`ui` は渡された場合のみ含める。
 * 既に存在する場合は呼び出し側のロジック誤りとして throw する。
 */
export function writeFreshConfig(ui: LismCliConfig | null): string {
  const filePath = getDefaultConfigPath();
  if (fs.existsSync(filePath)) {
    throw new Error(t('config.freshConfigExists', { path: filePath }));
  }
  const body = renderConfigTemplate(ui);
  fs.writeFileSync(filePath, body);
  return filePath;
}

function renderConfigTemplate(ui: LismCliConfig | null): string {
  const lines = [
    // `.js` でもエディタ補完・typo 検出が効くように LismConfig 型（#449）を JSDoc で付与する
    "/** @type {import('lism-css/config-types').LismConfig} */",
    'export default {',
    '  // tokens: {},',
    '  // props: {},',
    '  // traits: {},',
    '  // breakpoints: {},',
  ];
  if (ui) {
    lines.push(`  ui: ${renderCliObject(ui, '  ')},`);
  }
  lines.push('};', '');
  return lines.join('\n');
}

export function renderUiSnippet(cli: LismCliConfig): string {
  return `ui: ${renderCliObject(cli, '')},`;
}

function renderCliObject(cli: LismCliConfig, indent: string): string {
  return ['{', `${indent}  framework: ${JSON.stringify(cli.framework)},`, `${indent}  dir: ${JSON.stringify(cli.dir)},`, `${indent}}`].join('\n');
}
