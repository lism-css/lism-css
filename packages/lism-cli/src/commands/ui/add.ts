import fs from 'node:fs';
import path from 'node:path';
import { confirm, select } from '@inquirer/prompts';
import { configExists, readConfig } from '../../config.js';
import {
  fetchCatalog,
  fetchComponent,
  fetchHelper,
  type FetchOptions,
  type RegistryCatalog,
  type RegistryComponent,
  type RegistryFile,
} from './fetcher.js';
import { resolveHelperPlaceholder } from '../../transform.js';
import { runInit } from './init.js';
import { logger } from '../../logger.js';
import { normalizeComponentName } from './normalize.js';
import type { LismCliConfig } from '../../config.js';

interface AddOptions {
  overwrite: boolean;
  all: boolean;
  ref?: string;
}

/** 上書き方針 */
type OverwritePolicy = 'all' | 'none' | 'per-component';

export async function addCommand(names: string[], options: AddOptions): Promise<void> {
  let config: LismCliConfig;

  if (configExists()) {
    config = await readConfig();
  } else {
    logger.info('lism.config.js が見つかりません。セットアップを開始します...\n');
    config = await runInit();
    console.log();
  }

  const fetchOpts: FetchOptions = { ref: options.ref };

  // カタログを 1 回取得して入力の正規化（case-insensitive）に使う
  let catalog: RegistryCatalog;
  try {
    catalog = await fetchCatalog(fetchOpts);
  } catch (err) {
    const refInfo = options.ref ? ` (ref: ${options.ref})` : '';
    const reason = err instanceof Error ? err.message : String(err);
    logger.error(`カタログの取得に失敗しました${refInfo}: ${reason}`);
    process.exit(1);
  }

  if (options.all) {
    names = catalog.components.map((c) => c.name);
    logger.info(`全 ${names.length} コンポーネントを追加します...`);
  }

  if (names.length === 0) {
    logger.error('追加するコンポーネント名を指定してください。');
    process.exit(1);
  }

  // 入力を PascalCase の正規名に解決
  // kebab-case / snake_case / camelCase / PascalCase / lowercase のいずれも受け付ける
  const resolvedNames: string[] = [];
  const notFound: string[] = [];
  for (const input of names) {
    const normalized = normalizeComponentName(input);
    const match = catalog.components.find((c) => normalizeComponentName(c.name) === normalized);
    if (match) resolvedNames.push(match.name);
    else notFound.push(input);
  }
  if (notFound.length > 0) {
    logger.error(`見つからないコンポーネント: ${notFound.join(', ')}`);
    process.exit(1);
  }

  // 全コンポーネントを並列 fetch し、書き込みは逐次で実行
  const excludeRootFiles = new Set(catalog.excludeComponentFiles);
  const results = await Promise.allSettled(resolvedNames.map((n) => fetchComponent(n, excludeRootFiles, fetchOpts)));

  const installedHelpers = new Set<string>();

  // -o フラグがなく複数コンポーネントの場合、最初に全体の上書き方針を確認
  let overwritePolicy: OverwritePolicy = 'per-component';
  if (!options.overwrite && resolvedNames.length > 1) {
    overwritePolicy = await askOverwritePolicy();
  }

  const overwriteAll = options.overwrite || overwritePolicy === 'all';

  let hasFailure = false;

  for (let i = 0; i < resolvedNames.length; i++) {
    const result = results[i];
    if (result.status === 'rejected') {
      logger.error(`"${resolvedNames[i]}" の取得に失敗しました: ${String(result.reason)}`);
      hasFailure = true;
      continue;
    }
    const helperFailed = await writeComponent(result.value, config, overwriteAll, overwritePolicy, installedHelpers, fetchOpts);
    if (helperFailed) hasFailure = true;
  }

  if (hasFailure) {
    logger.error('一部のコンポーネント / helper の追加に失敗しました。');
    process.exit(1);
  }

  logger.success('完了しました。');
}

async function askOverwritePolicy(): Promise<OverwritePolicy> {
  return select<OverwritePolicy>({
    message: '既存ファイルの上書き方針を選択してください:',
    choices: [
      { name: '全て上書き', value: 'all' },
      { name: '全てスキップ', value: 'none' },
      { name: 'コンポーネントごとに確認', value: 'per-component' },
    ],
  });
}

/** ファイルを指定パスに書き込む（ディレクトリ自動作成 + ログ出力） */
function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  logger.log(`  作成: ${path.relative(process.cwd(), filePath)}`);
}

/** コンポーネントディレクトリ内に既存ファイルがあるか */
function hasExistingFiles(files: RegistryFile[], baseDir: string): boolean {
  return files.some((f) => fs.existsSync(path.join(baseDir, f.path)));
}

async function writeComponent(
  component: RegistryComponent,
  config: LismCliConfig,
  overwriteAll: boolean,
  policy: OverwritePolicy,
  installedHelpers: Set<string>,
  fetchOpts: FetchOptions
): Promise<boolean> {
  logger.info(`${component.name} を展開中...`);

  const filesToWrite = [...component.files.shared, ...component.files[config.framework]];

  // component.name は registry-index.json 由来で PascalCase が保持されている
  const componentDirName = component.name;
  const componentDir = path.resolve(process.cwd(), config.componentsDir, componentDirName);
  const helperDir = path.resolve(process.cwd(), config.helperDir);

  // コンポーネント単位の上書き判定
  let shouldWrite: boolean;
  const hasExisting = hasExistingFiles(filesToWrite, componentDir);

  if (overwriteAll) {
    shouldWrite = true;
  } else if (!hasExisting) {
    // 新規コンポーネントは policy に関わらず書く
    shouldWrite = true;
  } else if (policy === 'none') {
    shouldWrite = false;
  } else if (policy === 'per-component') {
    shouldWrite = await confirm({
      message: `${componentDirName} は既に存在します。上書きしますか？`,
      default: false,
    });
  } else {
    shouldWrite = true;
  }

  if (!shouldWrite) {
    logger.log(`  スキップ: ${componentDirName}`);
  } else {
    for (const file of filesToWrite) {
      const filePath = path.join(componentDir, file.path);
      const content = resolveHelperPlaceholder(file.content, file.path, componentDir, helperDir);
      writeFile(filePath, content);
    }
  }

  // helper 依存を並列 fetch
  const helpersToInstall = component.helpers.filter((h) => !installedHelpers.has(h));
  for (const h of helpersToInstall) installedHelpers.add(h);

  let helperFailed = false;

  if (helpersToInstall.length > 0) {
    const helperResults = await Promise.allSettled(helpersToInstall.map((h) => fetchHelper(h, fetchOpts)));

    for (let i = 0; i < helpersToInstall.length; i++) {
      const result = helperResults[i];
      if (result.status === 'rejected') {
        logger.error(`  helper "${helpersToInstall[i]}" の取得に失敗しました: ${String(result.reason)}`);
        helperFailed = true;
        continue;
      }

      for (const file of result.value.files) {
        const filePath = path.join(helperDir, file.path);

        if (fs.existsSync(filePath) && !overwriteAll) {
          if (policy === 'none') {
            logger.log(`  スキップ: ${file.path}`);
            continue;
          }
          if (policy === 'per-component') {
            const shouldOverwrite = await confirm({
              message: `${path.relative(process.cwd(), filePath)} は既に存在します。上書きしますか？`,
              default: false,
            });
            if (!shouldOverwrite) {
              logger.log(`  スキップ: ${file.path}`);
              continue;
            }
          }
        }

        writeFile(filePath, file.content);
      }
    }
  }

  return helperFailed;
}
