import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'data');

const cache = new Map<string, unknown>();

export function loadJSON<T>(filename: string, schema: ZodType<T>): T {
	if (cache.has(filename)) return cache.get(filename) as T;
	const filePath = resolve(dataDir, filename);
	const raw = readFileSync(filePath, 'utf-8');
	const data = schema.parse(JSON.parse(raw));
	cache.set(filename, data);
	return data;
}
