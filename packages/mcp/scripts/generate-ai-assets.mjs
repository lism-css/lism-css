#!/usr/bin/env node

/**
 * .claude/skills/lism-css-guide/*.md → packages/mcp/src/data/guides/ にコピーする。
 * MCP サーバーのビルド前に実行し、スキル Markdown を参照データとして取り込む。
 */

import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');
const SRC = resolve(ROOT, '.claude', 'skills', 'lism-css-guide');
const DEST = resolve(__dirname, '..', 'src', 'data', 'guides');

mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.md'));

for (const file of files) {
  cpSync(resolve(SRC, file), resolve(DEST, file));
}

console.log(`generate:ai-assets — ${files.length} files copied to src/data/guides/`);
