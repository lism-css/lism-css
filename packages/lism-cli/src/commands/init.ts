import { confirm } from '@inquirer/prompts';
import { findConfigFile, writeFreshConfig } from '../config.js';
import { promptUiConfig, type PromptUiConfigOptions } from './ui/promptUiConfig.js';
import { logger } from '../logger.js';
import { t } from '../i18n.js';

export type InitOptions = PromptUiConfigOptions;

/**
 * lism.config.js を新規生成する汎用 init コマンド。
 * core 設定（tokens/props 等）のひな形を出力し、UI コンポーネントを使うかを対話で確認して
 * Yes の場合のみ `ui:` セクションを含める（lism-ui を使わないユーザーの config に
 * 見慣れない `ui:` セクションを黙って書き込まないため。デフォルトは No）。
 * 既に lism.config.* が存在する場合はファイルを一切変更しない
 * （`ui:` セクションの後付けは `ui add` 実行時のスニペット案内で対応する）。
 */
export async function initCommand(options: InitOptions = {}): Promise<void> {
  const found = findConfigFile();

  if (found?.kind === 'module') {
    logger.warn(t('init.alreadyExists', { filename: found.filename }));
    return;
  }
  if (found?.kind === 'legacy-json') {
    logger.warn(t('init.legacyDetected', { filename: found.filename }));
  }

  // --framework が明示されている場合は UI を使う意思とみなし、確認プロンプトを省略する
  const useUi = options.framework !== undefined || (await confirm({ message: t('init.promptUseUi'), default: false }));
  const ui = useUi ? await promptUiConfig(options) : null;

  const outPath = writeFreshConfig(ui);
  logger.success(t('init.created', { path: outPath }));
}
