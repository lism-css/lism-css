import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'data');

export function loadJSON<T>(filename: string): T {
	const filePath = resolve(dataDir, filename);
	const raw = readFileSync(filePath, 'utf-8');
	return JSON.parse(raw) as T;
}
