import fs from 'node:fs';
import path from 'node:path';
import { confirm } from '@inquirer/prompts';
import { configExists, readConfig } from '../config.js';
import { fetchCatalog, fetchComponent, fetchHelper } from '../registry.js';
import { resolveHelperPlaceholder } from '../transform.js';
import { logger } from '../logger.js';
import type { LismConfig } from '../config.js';
import type { RegistryFile } from '../registry.js';

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

	// 追加済み helper を追跡（重複 fetch を防ぐ）
	const installedHelpers = new Set<string>();

	for (const name of names) {
		await addComponent(name, config, options.overwrite, installedHelpers);
	}

	logger.success('完了しました。');
}

async function addComponent(name: string, config: LismConfig, overwrite: boolean, installedHelpers: Set<string>): Promise<void> {
	logger.info(`${name} を取得中...`);

	let component;
	try {
		component = await fetchComponent(name);
	} catch {
		logger.error(`コンポーネント "${name}" が見つかりません。`);
		return;
	}

	// framework に応じて書き込むファイルを選定
	const filesToWrite: RegistryFile[] = [...component.files.shared, ...component.files[config.framework]];

	// コンポーネント名を PascalCase に（先頭大文字）
	const componentDirName = name.charAt(0).toUpperCase() + name.slice(1);
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

		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, content);
		logger.log(`  作成: ${path.relative(process.cwd(), filePath)}`);
	}

	// helper 依存の解決
	for (const helperName of component.helpers) {
		if (installedHelpers.has(helperName)) continue;
		installedHelpers.add(helperName);
		await installHelper(helperName, helperDir);
	}
}

async function installHelper(name: string, helperDir: string): Promise<void> {
	logger.info(`  helper "${name}" を取得中...`);

	let helper;
	try {
		helper = await fetchHelper(name);
	} catch {
		logger.error(`  helper "${name}" が見つかりません。`);
		return;
	}

	for (const file of helper.files) {
		const filePath = path.join(helperDir, file.path);
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, file.content);
		logger.log(`  作成: ${path.relative(process.cwd(), filePath)}`);
	}
}
