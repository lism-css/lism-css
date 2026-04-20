#!/usr/bin/env node
// examples 配下の各 package.json に `"private": true` が付いているかチェックする。
// npm への誤公開を防ぐためのガード（CLAUDE.md の運用ルールと対応）。
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const examplesDir = resolve(__dirname, '..', 'examples');

if (!existsSync(examplesDir)) {
  console.log('No examples/ directory. Nothing to check.');
  process.exit(0);
}

let errors = 0;
for (const entry of readdirSync(examplesDir)) {
  const pkgPath = resolve(examplesDir, entry, 'package.json');
  if (!existsSync(pkgPath)) continue;
  const stat = statSync(resolve(examplesDir, entry));
  if (!stat.isDirectory()) continue;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  if (pkg.private !== true) {
    console.error(`  ✗ examples/${entry}/package.json に "private": true がありません`);
    errors++;
  } else {
    console.log(`  ✓ examples/${entry}  (private: true)`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} 件のエラーが見つかりました。"private": true を追加してください。`);
  process.exit(1);
}
