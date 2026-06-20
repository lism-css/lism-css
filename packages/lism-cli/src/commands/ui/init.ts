import { findConfigFile, readConfig, writeFreshConfig, renderUiSnippet } from '../../config.js';
import { promptUiConfig, type PromptUiConfigOptions } from './promptUiConfig.js';
import { logger } from '../../logger.js';
import { t } from '../../i18n.js';
import type { LismCliConfig } from '../../config.js';

export type InitOptions = PromptUiConfigOptions;

/**
 * UI セクションの値を対話で収集し、設定ファイルが無ければ新規作成する。
 * 既に lism.config.* が存在する場合はファイルを書き換えず、貼り付け用スニペットを案内するだけにする
 * （CSS カスタマイズ用に先に作られたファイルを壊さないため）。収集した config を返す。
 */
export async function runInit(options: InitOptions = {}): Promise<LismCliConfig> {
  const config = await promptUiConfig(options);
  const found = findConfigFile();

  if (found?.kind === 'module') {
    logger.info(t('ui.init.snippetGuide', { filename: found.filename, snippet: renderUiSnippet(config) }));
  } else {
    // found が null、または legacy-json（別途 initCommand で warning 済み）
    const outPath = writeFreshConfig(config);
    logger.success(t('ui.init.created', { path: outPath }));
  }

  return config;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const found = findConfigFile();

  if (found?.kind === 'legacy-json') {
    logger.warn(t('ui.init.legacyDetected', { filename: found.filename }));
  } else if (found?.kind === 'module') {
    let existing: LismCliConfig | null;
    try {
      existing = await readConfig();
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
    if (existing) {
      logger.warn(t('ui.init.alreadyExists', { filename: found.filename }));
      return;
    }
  }

  await runInit(options);
}
