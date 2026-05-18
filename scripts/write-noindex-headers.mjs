#!/usr/bin/env node
// Cloudflare Pages にデプロイするテンプレートプレビュー用に、
// 指定された dist ディレクトリへ `_headers` を出力するヘルパー。
// プレビュー URL (*.pages.dev) が検索インデックスされないようにする。
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/write-noindex-headers.mjs <dist-dir>');
  process.exit(1);
}

const distDir = resolve(process.cwd(), target);

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

const headersPath = resolve(distDir, '_headers');
const content = `/*\n  X-Robots-Tag: noindex\n`;

writeFileSync(headersPath, content, 'utf-8');
console.log(`✓ wrote ${headersPath}`);
