#!/usr/bin/env node
// 各テンプレの .lism-sync.json を読み、`templates/_shared/...` から
// テンプレ配下の `src/...` へファイルを物理コピーする。
// `_shared/` は配信対象外。各テンプレ側にコピーされたファイルが CLI 配信される。
//
// 使い方:
//   node scripts/sync-templates.mjs           ... 同期実行（差分があれば書き換え）
//   node scripts/sync-templates.mjs --check   ... 差分があれば exit 1（CI 用）
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATES_DIR = resolve(ROOT, 'templates');

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes('--check');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.turbo', '_shared']);

if (!existsSync(TEMPLATES_DIR)) {
  console.log('No templates/ directory. Nothing to sync.');
  process.exit(0);
}

function findSyncFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const entryPath = join(dir, entry);
    const stat = statSync(entryPath);
    if (stat.isDirectory()) {
      found.push(...findSyncFiles(entryPath));
    } else if (entry === '.lism-sync.json') {
      found.push(entryPath);
    }
  }
  return found;
}

const drift = [];
const updated = [];
const inSync = [];

for (const syncFile of findSyncFiles(TEMPLATES_DIR)) {
  const templateDir = dirname(syncFile);
  const relTemplate = relative(ROOT, templateDir);
  const config = JSON.parse(readFileSync(syncFile, 'utf8'));

  if (!config.from || !Array.isArray(config.files)) {
    console.error(`  ✗ ${relative(ROOT, syncFile)}: "from" と "files" は必須です`);
    process.exitCode = 1;
    continue;
  }

  const sourceBase = resolve(TEMPLATES_DIR, config.from);

  for (const filePath of config.files) {
    const src = join(sourceBase, filePath);
    const dest = join(templateDir, 'src', filePath);
    const relDest = relative(ROOT, dest);

    if (!existsSync(src)) {
      console.error(`  ✗ ${relDest}: source ${relative(ROOT, src)} が存在しません`);
      drift.push(relDest);
      continue;
    }

    const srcContent = readFileSync(src, 'utf8');
    const destContent = existsSync(dest) ? readFileSync(dest, 'utf8') : null;

    if (destContent === srcContent) {
      inSync.push(relDest);
      continue;
    }

    if (CHECK_ONLY) {
      drift.push(relDest);
    } else {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, srcContent);
      updated.push(relDest);
    }
  }

  if (!CHECK_ONLY) {
    console.log(`  ▸ ${relTemplate} (${config.files.length} files)`);
  }
}

if (CHECK_ONLY) {
  if (drift.length > 0) {
    console.error('Sync drift detected:');
    for (const f of drift) console.error(`  ✗ ${f}`);
    console.error('\n`pnpm sync:templates` を実行して同期してください。');
    process.exit(1);
  }
  console.log(`✓ all in sync (${inSync.length} files)`);
} else {
  if (updated.length > 0) {
    console.log(`\n  ✓ updated ${updated.length} files`);
    for (const f of updated) console.log(`    → ${f}`);
  }
  if (inSync.length > 0 && updated.length === 0) {
    console.log(`\n✓ already in sync (${inSync.length} files)`);
  }
}
