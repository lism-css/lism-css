#!/usr/bin/env node
// templates 配下の各 package.json に `"private": true` が付いているかチェックする。
// npm への誤公開を防ぐためのガード（CLAUDE.md の運用ルールと対応）。
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, '..', 'templates');

if (!existsSync(templatesDir)) {
  console.log('No templates/ directory. Nothing to check.');
  process.exit(0);
}

let errors = 0;

function checkPackageDirs(dir, rel = '') {
  for (const entry of readdirSync(dir)) {
    const entryPath = resolve(dir, entry);
    const stat = statSync(entryPath);
    if (!stat.isDirectory()) continue;

    const nextRel = rel ? `${rel}/${entry}` : entry;
    const pkgPath = resolve(entryPath, 'package.json');
    if (existsSync(pkgPath)) {
      checkPackage(pkgPath, nextRel);
      continue;
    }

    checkPackageDirs(entryPath, nextRel);
  }
}

function checkPackage(pkgPath, rel) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  if (pkg.private !== true) {
    console.error(`  ✗ templates/${rel}/package.json に "private": true がありません`);
    errors++;
  } else {
    console.log(`  ✓ templates/${rel}  (private: true)`);
  }
}

checkPackageDirs(templatesDir);

if (errors > 0) {
  console.error(`\n${errors} 件のエラーが見つかりました。"private": true を追加してください。`);
  process.exit(1);
}
