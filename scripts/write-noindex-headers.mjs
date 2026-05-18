#!/usr/bin/env node
// Cloudflare Pages にデプロイするテンプレートプレビュー用に、
// 指定された dist ディレクトリへ `_headers` を出力するヘルパー。
// プレビュー URL (*.pages.dev) が検索インデックスされないようにする。
import { writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/write-noindex-headers.mjs <dist-dir>');
  process.exit(1);
}

const distDir = resolve(process.cwd(), target);

try {
  const stat = statSync(distDir);
  if (!stat.isDirectory()) {
    console.error(`✗ ${distDir} はディレクトリではありません`);
    process.exit(1);
  }
} catch {
  console.error(`✗ ${distDir} が見つかりません。ビルドが成功しているか確認してください`);
  process.exit(1);
}

const headersPath = resolve(distDir, '_headers');
const content = `/*\n  X-Robots-Tag: noindex\n`;

writeFileSync(headersPath, content, 'utf-8');
console.log(`✓ wrote ${headersPath}`);
