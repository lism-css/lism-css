import fs from 'node:fs';
import path from 'node:path';
import { confirm } from '@inquirer/prompts';
import { configExists, readConfig } from '../config.js';
import { fetchCatalog, fetchComponent, fetchHelper } from '../registry.js';
import { resolveHelperPlaceholder } from '../transform.js';
import { logger } from '../logger.js';
import type { LismConfig } from '../config.js';
import type { RegistryComponent } from '../registry.js';

interface AddOptions {
	overwrite: boolean;
	all: boolean;
}

export async function addCommand(names: string[], options: AddOptions): Promise<void> {
	if (!configExists()) {
		logger.error('lism-ui.json が見つかりません。先に `lism-ui init` を実行してください。');
		process.exit(1);
	}

	const config = readConfig();

	// --all: カタログから全コンポーネント名を取得
	if (options.all) {
		const catalog = await fetchCatalog();
		names = catalog.components.map((c) => c.name);
		logger.info(`全 ${names.length} コンポーネントを追加します...`);
	}

	if (names.length === 0) {
		logger.error('追加するコンポーネント名を指定してください。');
		process.exit(1);
	}

	// 全コンポーネントを並列 fetch し、書き込みは逐次で実行
	const results = await Promise.allSettled(names.map((name) => fetchComponent(name)));

	const installedHelpers = new Set<string>();

	for (let i = 0; i < names.length; i++) {
		const result = results[i];
		if (result.status === 'rejected') {
			logger.error(`"${names[i]}" の取得に失敗しました: ${String(result.reason)}`);
			continue;
		}
		await writeComponent(result.value, config, options.overwrite, installedHelpers);
	}

	logger.success('完了しました。');
}

/** ファイルを指定パスに書き込む（ディレクトリ自動作成 + ログ出力） */
function writeFile(filePath: string, content: string): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, content);
	logger.log(`  作成: ${path.relative(process.cwd(), filePath)}`);
}

async function writeComponent(component: RegistryComponent, config: LismConfig, overwrite: boolean, installedHelpers: Set<string>): Promise<void> {
	logger.info(`${component.name} を展開中...`);

	const filesToWrite = [...component.files.shared, ...component.files[config.framework]];

	// コンポーネント名を PascalCase に（先頭大文字）
	const componentDirName = component.name.charAt(0).toUpperCase() + component.name.slice(1);
	const componentDir = path.resolve(process.cwd(), config.componentsDir, componentDirName);
	const helperDir = path.resolve(process.cwd(), config.helperDir);

	for (const file of filesToWrite) {
		const filePath = path.join(componentDir, file.path);

		// 上書き確認
		if (fs.existsSync(filePath) && !overwrite) {
			const shouldOverwrite = await confirm({
				message: `${path.relative(process.cwd(), filePath)} は既に存在します。上書きしますか？`,
				default: false,
			});
			if (!shouldOverwrite) {
				logger.log(`  スキップ: ${file.path}`);
				continue;
			}
		}

		// {{HELPER}} プレースホルダーを実際のパスに置換
		const content = resolveHelperPlaceholder(file.content, file.path, componentDir, helperDir);
		writeFile(filePath, content);
	}

	// helper 依存を並列 fetch
	const helpersToInstall = component.helpers.filter((h) => !installedHelpers.has(h));
	for (const h of helpersToInstall) installedHelpers.add(h);

	if (helpersToInstall.length > 0) {
		const helperResults = await Promise.allSettled(helpersToInstall.map((h) => fetchHelper(h)));

		for (let i = 0; i < helpersToInstall.length; i++) {
			const result = helperResults[i];
			if (result.status === 'rejected') {
				logger.error(`  helper "${helpersToInstall[i]}" の取得に失敗しました: ${String(result.reason)}`);
				continue;
			}

			for (const file of result.value.files) {
				const filePath = path.join(helperDir, file.path);

				// helper も上書き確認（コンポーネントファイルと同じ挙動）
				if (fs.existsSync(filePath) && !overwrite) {
					const shouldOverwrite = await confirm({
						message: `${path.relative(process.cwd(), filePath)} は既に存在します。上書きしますか？`,
						default: false,
					});
					if (!shouldOverwrite) {
						logger.log(`  スキップ: ${file.path}`);
						continue;
					}
				}

				writeFile(filePath, file.content);
			}
		}
	}
}
