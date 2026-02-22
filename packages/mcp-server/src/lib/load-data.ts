import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'data');

const cache = new Map<string, unknown>();

export function loadJSON<T>(filename: string): T {
	if (cache.has(filename)) return cache.get(filename) as T;
	const filePath = resolve(dataDir, filename);
	const raw = readFileSync(filePath, 'utf-8');
	const data = JSON.parse(raw) as T;
	cache.set(filename, data);
	return data;
}
