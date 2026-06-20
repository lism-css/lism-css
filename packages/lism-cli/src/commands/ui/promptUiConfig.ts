import { select, input } from '@inquirer/prompts';
import { t } from '../../i18n.js';
import type { LismCliConfig } from '../../config.js';

export interface PromptUiConfigOptions {
  framework?: LismCliConfig['framework'];
  componentsDir?: string;
  helperDir?: string;
}

/**
 * UI セクション（`framework`/`componentsDir`/`helperDir`）を対話で収集する。
 * ファイルの読み書きは一切行わない。永続化するかどうかは呼び出し側の責務
 * （`runInit` は書き込み、`addCommand` は今回限りの値として使うだけ）。
 */
export async function promptUiConfig(options: PromptUiConfigOptions = {}): Promise<LismCliConfig> {
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

  return { framework, componentsDir, helperDir };
}
