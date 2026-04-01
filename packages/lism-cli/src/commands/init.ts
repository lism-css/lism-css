import { select, input } from '@inquirer/prompts';
import { configExists, writeConfig, getConfigPath } from '../config.js';
import { logger } from '../logger.js';
import type { LismConfig } from '../config.js';

/** 対話式で設定を作成し lism-ui.json に書き込む。作成した config を返す。 */
export async function runInit(): Promise<LismConfig> {
  const framework = await select<LismConfig['framework']>({
    message: 'フレームワークを選択してください:',
    choices: [
      { name: 'React', value: 'react' },
      { name: 'Astro', value: 'astro' },
    ],
  });

  const componentsDir = await input({
    message: 'コンポーネントの出力先ディレクトリ:',
    default: 'src/components/ui',
  });

  const helperDir = await input({
    message: 'helper の出力先ディレクトリ:',
    default: `${componentsDir}/_helper`,
  });

  const config: LismConfig = { framework, componentsDir, helperDir };
  writeConfig(config);
  logger.success(`${getConfigPath()} を作成しました。`);

  return config;
}

export async function initCommand(): Promise<void> {
  if (configExists()) {
    logger.warn(`${getConfigPath()} は既に存在します。上書きする場合は削除してから再実行してください。`);
    return;
  }

  await runInit();
}
