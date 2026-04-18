import { select, input } from '@inquirer/prompts';
import { findConfigFile, patchConfigWithCli, writeFreshConfig } from '../../config.js';
import { logger } from '../../logger.js';
import type { LismCliConfig } from '../../config.js';

/** 対話式で設定を作成し lism.config.* に書き込む（既存時は cli セクションをパッチ）。作成した config を返す。 */
export async function runInit(): Promise<LismCliConfig> {
  const framework = await select<LismCliConfig['framework']>({
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

  const config: LismCliConfig = { framework, componentsDir, helperDir };

  const found = findConfigFile();

  if (found?.kind === 'module') {
    const { patched, path: outPath } = await patchConfigWithCli(config, found.path);
    if (patched) {
      logger.success(`${outPath} に cli セクションを追記しました。`);
    } else {
      logger.warn(`${outPath} に既に cli セクションが含まれているか、export default が検出できませんでした。手動で追記してください。`);
    }
  } else {
    // found が null、または legacy-json（別途 initCommand で warning 済み）
    const outPath = writeFreshConfig(config);
    logger.success(`${outPath} を作成しました。`);
  }

  return config;
}

export async function initCommand(): Promise<void> {
  const found = findConfigFile();
  if (found?.kind === 'legacy-json') {
    logger.warn(`${found.filename} を検出しました。lism.config.js へ移行します。古いファイルは後で削除してください。`);
  }

  await runInit();
}
