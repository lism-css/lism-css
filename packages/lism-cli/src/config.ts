import fs from 'node:fs';
import path from 'node:path';

const CONFIG_FILE = 'lism-ui.json';

export interface LismConfig {
	framework: 'react' | 'astro';
	componentsDir: string;
	helperDir: string;
}

/** lism-ui.json のパスを返す（cwd 基準） */
export function getConfigPath(): string {
	return path.resolve(process.cwd(), CONFIG_FILE);
}

/** lism-ui.json が存在するか */
export function configExists(): boolean {
	return fs.existsSync(getConfigPath());
}

/** lism-ui.json を読み込む */
export function readConfig(): LismConfig {
	const configPath = getConfigPath();
	const raw = fs.readFileSync(configPath, 'utf-8');
	return JSON.parse(raw) as LismConfig;
}

/** lism-ui.json を書き込む */
export function writeConfig(config: LismConfig): void {
	const configPath = getConfigPath();
	fs.writeFileSync(configPath, JSON.stringify(config, null, '\t') + '\n');
}
