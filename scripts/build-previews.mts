#!/usr/bin/env tsx
// テンプレプレビューを単一 Cloudflare Pages（lism-templates）へ集約するための
// merged ツリーを構築するオーケストレーター。
//
// templates/manifest.ts の TEMPLATES を Single Source of Truth として「ビルド単位」へ展開し、
// 各単位を build-preview.mjs（base/site 注入ビルド）→ rebase-html.mjs（手書き絶対参照の prefix 付与）
// に通して `.preview/merged/<dest>/` へ配置する。最後に全体 noindex の `_headers` を出力する。
//
// 配信パス設計（PR の決定事項どおり）:
//   - project / static-html             : /{slug}/        （en overlay があれば /{slug}/en/ も）
//   - single-project-variant（lp/astro）: /{prefix}/      （en は dist 同梱の /{prefix}/en/...）
//     prefix = sourcePath.replace('/', '-')（lp/astro → lp-astro）
//   - draft variant（ryokan 等）は merged から除外する
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateDef } from '../templates/manifest.ts';
// ルートに "type": "module" が無く tsx は manifest.ts を CommonJS として読み込むため、
// named import (TEMPLATES) は ESM 名前空間に展開されない。default(= module.exports)経由で取得する。
import manifestModule from '../templates/manifest.ts';

const TEMPLATES = (manifestModule as unknown as { TEMPLATES: TemplateDef[] }).TEMPLATES;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const MERGED = path.join(ROOT, '.preview', 'merged');

// 集約サイトのホスト名。sitemap / canonical に使われる（noindex なので実害は無いが正しく付与する）
const SITE = 'https://templates.lism-css.com';

type Stack = 'astro' | 'vite';

interface Unit {
  pkg: string; // pnpm パッケージ名（--filter 対象）
  stack: Stack;
  base: string; // Astro/Vite の base（末尾スラッシュあり）
  rebasePrefix: string; // 手書き絶対参照に付与する prefix（先頭スラッシュ・末尾なし）
  dest: string; // MERGED からの相対配置先
  lang?: string; // 指定時は .lang/<lang> overlay をマージしてビルド
  pagefind?: boolean; // astro build 後に pagefind インデックスを生成
  draftVariants?: string[]; // merged から除外する variant ディレクトリ名（single-project-variant 用）
}

// テンプレの package.json から name と build スクリプトを読む（pagefind 有無の判定に使う）
function readPkg(sourcePath: string): { name: string; build: string } {
  const pkg = JSON.parse(readFileSync(path.join(TEMPLATES_DIR, sourcePath, 'package.json'), 'utf-8'));
  return { name: pkg.name, build: pkg.scripts?.build ?? '' };
}

const units: Unit[] = [];

// --- project / static-html: slug ごとに 1 ユニット（en overlay があれば en も） ---
for (const t of TEMPLATES) {
  if (t.kind === 'single-project-variant') continue;
  if (t.draft) continue; // 単独 draft は配信しない
  if (!('sourcePath' in t)) {
    console.warn(`⚠ skip ${t.slug}: kind="${t.kind}" は build-previews 未対応`);
    continue;
  }
  if (t.stack !== 'astro' && t.stack !== 'vite') {
    console.warn(`⚠ skip ${t.slug}: stack="${t.stack}" は build-previews 未対応`);
    continue;
  }
  const { name, build } = readPkg(t.sourcePath);
  const pagefind = /pagefind/.test(build);
  units.push({ pkg: name, stack: t.stack, base: `/${t.slug}/`, rebasePrefix: `/${t.slug}`, dest: t.slug, pagefind });
  const enOverlay = 'langOverlays' in t ? t.langOverlays?.en : undefined;
  if (enOverlay) {
    units.push({ pkg: name, stack: t.stack, base: `/${t.slug}/en/`, rebasePrefix: `/${t.slug}/en`, dest: `${t.slug}/en`, lang: 'en', pagefind });
  }
}

// --- single-project-variant: sourcePath で dedupe して 1 ビルド（en は dist 同梱） ---
const variantGroups = new Map<string, { stack: Stack; draftVariants: string[] }>();
for (const t of TEMPLATES) {
  if (t.kind !== 'single-project-variant') continue;
  const stack = t.stack === 'vite' ? 'vite' : 'astro';
  let g = variantGroups.get(t.sourcePath);
  if (!g) {
    g = { stack, draftVariants: [] };
    variantGroups.set(t.sourcePath, g);
  }
  if (t.draft) g.draftVariants.push(t.variant);
}
for (const [sourcePath, g] of variantGroups) {
  const { name, build } = readPkg(sourcePath);
  const prefix = sourcePath.replace(/\//g, '-');
  units.push({
    pkg: name,
    stack: g.stack,
    base: `/${prefix}/`,
    rebasePrefix: `/${prefix}`,
    dest: prefix,
    pagefind: /pagefind/.test(build),
    draftVariants: g.draftVariants,
  });
}

// --- merged を作り直して各ユニットを構築 ---
rmSync(MERGED, { recursive: true, force: true });
mkdirSync(MERGED, { recursive: true });

console.log(`\n=== build-previews: ${units.length} ユニットを構築 → ${path.relative(ROOT, MERGED)} ===\n`);

for (const u of units) {
  const out = path.join(MERGED, u.dest);
  console.log(`\n──────── ${u.dest} (pkg=${u.pkg}, base=${u.base}) ────────`);

  const buildArgs = ['scripts/build-preview.mjs', '--pkg', u.pkg, '--stack', u.stack, '--base', u.base, '--site', SITE, '--out', out];
  if (u.lang) buildArgs.push('--lang', u.lang);
  if (u.pagefind) buildArgs.push('--pagefind');
  execFileSync('node', buildArgs, { stdio: 'inherit', cwd: ROOT });

  execFileSync('node', ['scripts/rebase-html.mjs', out, u.rebasePrefix], { stdio: 'inherit', cwd: ROOT });

  // draft variant を merged から除外（ja / en 両方を対象に。存在しなくても無害）
  for (const v of u.draftVariants ?? []) {
    rmSync(path.join(out, v), { recursive: true, force: true });
    rmSync(path.join(out, 'en', v), { recursive: true, force: true });
    console.log(`✓ draft variant を除外: ${u.dest}/${v}`);
  }
}

// --- 全体 noindex の _headers を merged ルートへ出力 ---
execFileSync('node', ['scripts/write-noindex-headers.mjs', MERGED], { stdio: 'inherit', cwd: ROOT });

console.log(`\n✓ 完了: ${path.relative(ROOT, MERGED)} に ${units.length} ユニットを集約しました\n`);
