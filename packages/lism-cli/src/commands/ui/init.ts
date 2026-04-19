import { select, input } from '@inquirer/prompts';
import { findConfigFile, hasCliSection, patchConfigWithCli, writeFreshConfig } from '../../config.js';
import { logger } from '../../logger.js';
import { t } from '../../i18n.js';
import type { LismCliConfig } from '../../config.js';

export interface InitOptions {
  framework?: LismCliConfig['framework'];
  componentsDir?: string;
  helperDir?: string;
  force?: boolean;
  /**
   * initCommand 経路で既に hasCliSection を評価済みのときにその結果を伝搬する内部用フラグ。
   * 未指定の場合は patchConfigWithCli 内で通常通り判定される。
   */
  existingCli?: boolean;
}

/**
 * 設定を作成し lism.config.* に書き込む（既存時は cli セクションをパッチ）。作成した config を返す。
 * options で指定された項目は prompt をスキップする（全指定なら完全非対話）。
 */
export async function runInit(options: InitOptions = {}): Promise<LismCliConfig> {
  const framework =
    options.framework ??
    (await select<LismCliConfig['framework']>({
      message: t('ui.init.promptFramework'),
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Astro', value: 'astro' },
      ],
    }));

  const componentsDir =
    options.componentsDir ??
    (await input({
      message: t('ui.init.promptComponentsDir'),
      default: 'src/components/ui',
    }));

  const helperDir =
    options.helperDir ??
    (await input({
      message: t('ui.init.promptHelperDir'),
      default: `${componentsDir}/_helper`,
    }));

  const config: LismCliConfig = { framework, componentsDir, helperDir };

  const found = findConfigFile();

  if (found?.kind === 'module') {
    const { patched, path: outPath } = await patchConfigWithCli(config, found.path, {
      force: options.force,
      existingCli: options.existingCli,
    });
    if (patched) {
      logger.success(t(options.force ? 'ui.init.patchedUpdate' : 'ui.init.patchedAdd', { path: outPath }));
    } else {
      logger.warn(t('ui.init.notPatched', { path: outPath }));
    }
  } else {
    // found が null、または legacy-json（別途 initCommand で warning 済み）
    const outPath = writeFreshConfig(config);
    logger.success(t('ui.init.created', { path: outPath }));
  }

  return config;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const found = findConfigFile();

  let existingCli = false;
  if (found?.kind === 'legacy-json') {
    logger.warn(t('ui.init.legacyDetected', { filename: found.filename }));
  } else if (found?.kind === 'module') {
    // ユーザーの lism.config.* に構文エラーがあると jiti が throw するため、
    // スタックトレース付きで uncaught にならないよう logger.error で握って終了する。
    try {
      existingCli = await hasCliSection(found.path);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
    if (existingCli) {
      if (!options.force) {
        logger.warn(t('ui.init.alreadyExists', { filename: found.filename }));
        return;
      }
      logger.warn(t('ui.init.willOverwrite', { filename: found.filename }));
    }
  }

  await runInit({ ...options, existingCli });
}
