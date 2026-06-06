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
import { readFileSync, rmSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
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

// --- ランディング（merged/index.html）生成 ---------------------------------

// カテゴリの表示順とラベル（docs の categories と揃える）
const CATEGORY_ORDER: { id: string; label: string }[] = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'blog', label: 'Blog' },
  { id: 'lp', label: 'LP' },
  { id: 'web', label: 'Web' },
];

// stack 表示ラベル（docs の stackLabels と揃える）
const STACK_LABELS: Record<string, string> = { astro: 'Astro', next: 'Next.js', vite: 'Vite + React', html: 'Static HTML' };

interface LandingCard {
  title: string;
  stack: string;
  jaPath: string; // 例: /blog-astro-minimal/
  enPath?: string; // en が配信されている場合のみ
}

// テンプレ定義から ja / en の配信パスを導出（build-previews のパス設計と対）。
// 配信非対応 kind は null。
function previewPaths(t: TemplateDef): { jaPath: string; enPath: string } | null {
  if (t.kind === 'single-project-variant') {
    const prefix = t.sourcePath.replace(/\//g, '-');
    return { jaPath: `/${prefix}/${t.variant}/`, enPath: `/${prefix}/en/${t.variant}/` };
  }
  if ('sourcePath' in t) {
    return { jaPath: `/${t.slug}/`, enPath: `/${t.slug}/en/` };
  }
  return null;
}

// 実際に merged へ出力された index.html の有無で掲載カードを集める（カテゴリ別）。
function collectLandingCards(): Map<string, LandingCard[]> {
  const byCat = new Map<string, LandingCard[]>();
  for (const t of TEMPLATES) {
    if (t.draft) continue;
    const paths = previewPaths(t);
    if (!paths) continue;
    if (!existsSync(path.join(MERGED, paths.jaPath, 'index.html'))) continue; // 未配信は載せない
    const enExists = existsSync(path.join(MERGED, paths.enPath, 'index.html'));
    const card: LandingCard = { title: t.title.ja, stack: t.stack, jaPath: paths.jaPath, ...(enExists ? { enPath: paths.enPath } : {}) };
    const arr = byCat.get(t.category) ?? [];
    arr.push(card);
    byCat.set(t.category, arr);
  }
  return byCat;
}

function renderLandingHtml(byCat: Map<string, LandingCard[]>): string {
  const sections = CATEGORY_ORDER.filter((c) => byCat.has(c.id)).map((c) => {
    const cards = byCat
      .get(c.id)!
      .map((card) => {
        const en = card.enPath ? `<a class="lnk lnk--sub" href="${card.enPath}">EN</a>` : '';
        const stack = STACK_LABELS[card.stack] ?? card.stack;
        return `          <li class="card">
            <div class="card__head">
              <span class="card__title">${card.title}</span>
              <span class="badge">${stack}</span>
            </div>
            <div class="card__links">
              <a class="lnk" href="${card.jaPath}">日本語</a>${en}
            </div>
          </li>`;
      })
      .join('\n');
    return `      <section class="group">
        <h2 class="group__title">${c.label}</h2>
        <ul class="cards">
${cards}
        </ul>
      </section>`;
  });
  const total = [...byCat.values()].reduce((n, arr) => n + arr.length, 0);

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Lism CSS Templates — Preview</title>
<style>
  :root {
    --brand: hsl(192, 72%, 48%);
    --bg: #fbfcfd;
    --panel: #ffffff;
    --text: #25282d;
    --text-2: #6b7280;
    --border: #e6e8ec;
    --radius: 12px;
    --maxw: 1080px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --brand: hsl(192, 72%, 56%);
      --bg: #15171a;
      --panel: #1d2024;
      --text: #e8eaed;
      --text-2: #9aa1ab;
      --border: #2c3035;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', 'Hiragino Sans', 'Noto Sans JP', Meiryo, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: var(--maxw); margin-inline: auto; padding: clamp(2rem, 5vw, 4.5rem) clamp(1.25rem, 4vw, 2rem); }
  .site-head { margin-bottom: clamp(2.5rem, 6vw, 4rem); }
  .site-head__eyebrow { color: var(--brand); font-size: .8rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 .6rem; }
  .site-head__title { font-size: clamp(1.9rem, 4.5vw, 2.8rem); font-weight: 800; letter-spacing: -.02em; margin: 0 0 .75rem; }
  .site-head__lead { color: var(--text-2); max-width: 44rem; margin: 0; font-size: 1rem; }
  .group { margin-bottom: clamp(2.5rem, 5vw, 3.5rem); }
  .group__title { font-size: 1.15rem; font-weight: 700; margin: 0 0 1.1rem; padding-bottom: .55rem; border-bottom: 1px solid var(--border); }
  .cards { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(258px, 1fr)); gap: 1rem; }
  .card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.15rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease;
  }
  .card:hover { border-color: color-mix(in srgb, var(--brand) 55%, var(--border)); transform: translateY(-2px); box-shadow: 0 6px 22px -12px rgba(0,0,0,.25); }
  .card__head { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
  .card__title { font-weight: 700; font-size: 1rem; }
  .badge { flex: none; font-size: .7rem; font-weight: 600; color: var(--text-2); border: 1px solid var(--border); border-radius: 999px; padding: .15rem .55rem; white-space: nowrap; }
  .card__links { display: flex; gap: .5rem; }
  .lnk {
    flex: 1;
    text-align: center;
    text-decoration: none;
    font-size: .85rem;
    font-weight: 600;
    padding: .5rem .75rem;
    border-radius: 8px;
    background: var(--brand);
    color: #fff;
    transition: opacity .15s ease;
  }
  .lnk:hover { opacity: .85; }
  .lnk--sub { flex: none; min-width: 4rem; background: transparent; color: var(--brand); border: 1px solid color-mix(in srgb, var(--brand) 45%, var(--border)); }
  .site-foot { margin-top: clamp(2.5rem, 6vw, 4rem); padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--text-2); font-size: .85rem; display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; }
  .site-foot a { color: var(--brand); text-decoration: none; }
  .site-foot a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="wrap">
    <header class="site-head">
      <p class="site-head__eyebrow">Lism CSS</p>
      <h1 class="site-head__title">Templates Preview</h1>
      <p class="site-head__lead">Lism CSS で構築したテンプレートのライブプレビュー集（全 ${total} 種）。各テンプレートは <code>npm create lism@latest</code> から生成できます。</p>
    </header>
    <main>
${sections.join('\n')}
    </main>
    <footer class="site-foot">
      <span>このサイトは検索エンジンにインデックスされません（noindex）。</span>
      <a href="https://lism-css.com/">lism-css.com →</a>
    </footer>
  </div>
</body>
</html>
`;
}

// merged/index.html を出力する。
function writeLanding(): void {
  const byCat = collectLandingCards();
  const html = renderLandingHtml(byCat);
  writeFileSync(path.join(MERGED, 'index.html'), html, 'utf-8');
  const total = [...byCat.values()].reduce((n, arr) => n + arr.length, 0);
  console.log(`✓ ランディングを生成: index.html（${total} テンプレを掲載）`);
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

// --- ルートランディング（全テンプレ一覧）を merged ルートへ出力 ---
// `/` の 404 を解消し、各テンプレの ja / en プレビューへの入口を 1 枚にまとめる。
// manifest を SSOT にしつつ、実際に merged へ出力された index.html の有無で掲載可否を判定するため、
// draft 除外や en 未配信のテンプレを取りこぼさず正確に反映できる。
writeLanding();

// --- 全体 noindex の _headers を merged ルートへ出力 ---
execFileSync('node', ['scripts/write-noindex-headers.mjs', MERGED], { stdio: 'inherit', cwd: ROOT });

console.log(`\n✓ 完了: ${path.relative(ROOT, MERGED)} に ${units.length} ユニットを集約しました\n`);
