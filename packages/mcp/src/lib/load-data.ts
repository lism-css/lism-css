import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { ZodType } from 'zod';
import { OverviewDataSchema, TokenCategorySchema, PropsSystemDataSchema, ComponentInfoSchema, DocsEntrySchema } from './schemas.js';

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

export function preloadAll(): void {
  const entries: { filename: string; schema: ZodType }[] = [
    { filename: 'overview.json', schema: OverviewDataSchema },
    { filename: 'tokens.json', schema: z.array(TokenCategorySchema) },
    { filename: 'props-system.json', schema: PropsSystemDataSchema },
    { filename: 'components.json', schema: z.array(ComponentInfoSchema) },
    { filename: 'docs-index.json', schema: z.array(DocsEntrySchema) },
  ];
  for (const { filename, schema } of entries) {
    loadJSON(filename, schema);
  }
}
