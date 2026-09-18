// 2 つのビルド成果物（dist）を正規化して全件比較し、差分を「空白だけ」と「構造」に分類する。
// 使い方: node scripts/compare-dist.mjs <baseDist> <newDist>
//
// 正規化するもの（ビルドごとに変わる、または同値とみなすもの）:
// - `_astro/` のハッシュ付きファイル名、Preview の demo-ID、Tabs の UUID、Astro の generator meta
// - スコープ属性 `data-astro-cid-*` / `astro-*` のハッシュ（ページ内の出現順で旧→新を対応付ける）
// - インライン <style> / <script> の中身（差分のあるペア数だけ数える。minify 差を拾わないため）
// `_astro/` のアセットはハッシュを除いた stem で 1 対 1 に対応付け、サイズと中身の両方を比べる。
// 同じ stem が複数あると対応付けできないため、その分は未比較として報告する。
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';

const [, , base, next] = process.argv;
if (!base || !next) {
  console.error('usage: node scripts/compare-dist.mjs <baseDist> <newDist>');
  process.exit(1);
}

const TEXT_EXT = new Set(['.xml', '.txt', '.md', '.json', '.css', '.js', '.svg']);
const CID_RE = /data-astro-cid-([a-z0-9]{8})/g;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.DS_Store') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function normCommon(s) {
  return s
    .replace(/\/_astro\/([\w.-]+?)\.[\w-]{8}\.(js|css)/g, '/_astro/$1.HASH.$2')
    .replace(/_astro\/([A-Za-z0-9-]+)_[A-Za-z0-9]{5,8}\.webp/g, '_astro/$1_HASH.webp')
    .replace(/demo-[a-z0-9]{7}/g, 'demo-X')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, 'UUID');
}

// HTML 本文と、インライン style / script の中身を分けて返す
function normHtml(s) {
  const styles = [];
  const scripts = [];
  s = normCommon(s)
    .replace(/<meta name="generator" content="Astro v[^"]+">/g, '<meta name="generator" content="Astro vX">')
    .replace(/class="astro-[a-z0-9]{8}"/g, 'class="astro-X"')
    .replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (m, attrs, css) => {
      styles.push(css);
      return `<style${attrs}>STYLE#${styles.length - 1}</style>`;
    })
    .replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, js) => {
      if (!js.trim()) return m;
      scripts.push(js);
      return `<script${attrs}>SCRIPT#${scripts.length - 1}</script>`;
    });
  return { s, styles, scripts };
}

const baseFiles = new Map(walk(base).map((p) => [relative(base, p), p]));
const nextFiles = new Map(walk(next).map((p) => [relative(next, p), p]));
const skip = (r) => r.startsWith('pagefind/') || r.startsWith('_astro/');
const onlyBase = [...baseFiles.keys()].filter((r) => !nextFiles.has(r) && !skip(r));
const onlyNext = [...nextFiles.keys()].filter((r) => !baseFiles.has(r) && !skip(r));
const pages = [...baseFiles.keys()].filter((r) => r.endsWith('.html') && nextFiles.has(r));

// スコープ属性ハッシュの旧→新マッピング（ページ内で最初に現れる順の重複なし列を突き合わせる）
const cidMap = new Map();
const parsed = new Map();
const distinct = (s) => [...new Set([...s.matchAll(CID_RE)].map((m) => m[1]))];
for (const rel of pages) {
  const A = normHtml(readFileSync(baseFiles.get(rel), 'utf8'));
  const B = normHtml(readFileSync(nextFiles.get(rel), 'utf8'));
  parsed.set(rel, [A, B]);
  const a = distinct(A.s + A.styles.join('\n'));
  const b = distinct(B.s + B.styles.join('\n'));
  if (a.length === b.length) a.forEach((x, i) => cidMap.has(x) || cidMap.set(x, b[i]));
}
const applyCidMap = (s) =>
  s.replace(CID_RE, (m, o) => 'data-astro-cid-' + (cidMap.get(o) ?? o)).replace(/astro-([a-z0-9]{8})\b/g, (m, o) => 'astro-' + (cidMap.get(o) ?? o));

// トークン整列で差分を分類する
const tokenize = (s) => s.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g) ?? [];
const tagName = (t) => (t.match(/^<\/?([a-zA-Z0-9-]+|!--)/)?.[1] ?? '?') + (t.startsWith('</') ? '/' : '');
const isWs = (t) => t !== undefined && !t.startsWith('<') && !t.trim();
const bump = (map, key, sample) => {
  const v = map.get(key) ?? { n: 0, samples: [] };
  v.n++;
  if (sample && v.samples.length < 2) v.samples.push(sample);
  map.set(key, v);
};
const wsCtx = new Map();
const textWsCtx = new Map();
const structural = [];
let identical = 0;
let wsOnly = 0;
let styleDiff = 0;
let scriptDiff = 0;
for (const rel of pages) {
  const [A, B] = parsed.get(rel);
  for (let i = 0; i < Math.max(A.styles.length, B.styles.length); i++) if (applyCidMap(A.styles[i] ?? '') !== (B.styles[i] ?? '')) styleDiff++;
  for (let i = 0; i < Math.max(A.scripts.length, B.scripts.length); i++) if ((A.scripts[i] ?? '') !== (B.scripts[i] ?? '')) scriptDiff++;
  const a = applyCidMap(A.s);
  const b = B.s;
  if (a === b) {
    identical++;
    continue;
  }
  const ta = tokenize(a);
  const tb = tokenize(b);
  let i = 0;
  let j = 0;
  let hadStructural = false;
  while (i < ta.length || j < tb.length) {
    const x = ta[i];
    const y = tb[j];
    if (x === y) {
      i++;
      j++;
      continue;
    }
    if (isWs(y) && !isWs(x)) {
      bump(wsCtx, `inserted: ${tagName(tb[j - 1] ?? '')} → ${tagName(tb[j + 1] ?? '')}`);
      j++;
      continue;
    }
    if (isWs(x) && !isWs(y)) {
      bump(wsCtx, `removed: ${tagName(ta[i - 1] ?? '')} → ${tagName(ta[i + 1] ?? '')}`);
      i++;
      continue;
    }
    if (isWs(x) && isWs(y)) {
      bump(wsCtx, `changed: ${tagName(ta[i - 1] ?? '')} → ${tagName(ta[i + 1] ?? '')}`);
      i++;
      j++;
      continue;
    }
    if (x !== undefined && y !== undefined && !x.startsWith('<') && !y.startsWith('<') && x.trim() === y.trim()) {
      bump(
        textWsCtx,
        `${(ta[i - 1] ?? '').slice(0, 60)} TEXT ${tagName(ta[i + 1] ?? '')}`,
        `${rel}: ${JSON.stringify(x.slice(0, 40))} -> ${JSON.stringify(y.slice(0, 40))}`
      );
      i++;
      j++;
      continue;
    }
    structural.push({ rel, a: ta.slice(Math.max(0, i - 2), i + 3).join(''), b: tb.slice(Math.max(0, j - 2), j + 3).join('') });
    hadStructural = true;
    break;
  }
  if (!hadStructural) wsOnly++;
}

// HTML 以外
const textDiffer = [];
const binaryDiffer = [];
for (const [rel, bp] of baseFiles) {
  const np = nextFiles.get(rel);
  if (!np || skip(rel) || rel.endsWith('.html')) continue;
  if (TEXT_EXT.has(extname(rel))) {
    if (normCommon(readFileSync(bp, 'utf8')) !== normCommon(readFileSync(np, 'utf8'))) textDiffer.push(rel);
  } else {
    const a = readFileSync(bp);
    const b = readFileSync(np);
    if (!a.equals(b)) binaryDiffer.push(`${rel} (${a.length} -> ${b.length})`);
  }
}

// _astro: stem で対応付けてサイズと中身を比較する
const stem = (r) =>
  basename(r)
    .replace(/\.[\w-]{8}\.(js|css)$/, '.$1')
    .replace(/_[A-Za-z0-9]{5,8}\.webp$/, '.webp');
const assets = new Map();
const collectAssets = (files, side) => {
  for (const r of files.keys()) {
    if (!r.startsWith('_astro/')) continue;
    const v = assets.get(stem(r)) ?? { a: [], b: [] };
    v[side].push(r);
    assets.set(stem(r), v);
  }
};
collectAssets(baseFiles, 'a');
collectAssets(nextFiles, 'b');
const assetChanged = [];
const assetContentChanged = [];
const assetAmbiguous = [];
for (const [k, v] of assets) {
  // stem が重複すると新旧のどれ同士を比べるべきか決められないので、比較せずに残す
  if (v.a.length > 1 || v.b.length > 1) {
    assetAmbiguous.push(`${k} (${v.a.length} -> ${v.b.length} files)`);
    continue;
  }
  const a = v.a.length ? readFileSync(baseFiles.get(v.a[0])) : null;
  const b = v.b.length ? readFileSync(nextFiles.get(v.b[0])) : null;
  if (!a || !b || a.length !== b.length) {
    assetChanged.push(`${k} (${a?.length ?? '-'} -> ${b?.length ?? '-'})`);
    continue;
  }
  const same = TEXT_EXT.has(extname(k)) ? normCommon(a.toString('utf8')) === normCommon(b.toString('utf8')) : a.equals(b);
  if (!same) assetContentChanged.push(`${k} (${a.length} bytes)`);
}

console.log(`pages: ${pages.length} (identical ${identical}, whitespace only ${wsOnly}, structural ${structural.length})`);
console.log(`inline style pairs differing: ${styleDiff}, inline script pairs differing: ${scriptDiff}`);
console.log(`scope hash mapping: ${cidMap.size} (changed ${[...cidMap].filter(([o, n]) => o !== n).length})`);
console.log(`only in base: ${onlyBase.length ? onlyBase.join(', ') : 'none'}`);
console.log(`only in new: ${onlyNext.length ? onlyNext.join(', ') : 'none'}`);
console.log(`non-HTML text differing: ${textDiffer.length ? textDiffer.join(', ') : 'none'}`);
console.log(`binary differing: ${binaryDiffer.length ? binaryDiffer.join(', ') : 'none'}`);
console.log(`_astro assets with changed size or presence: ${assetChanged.length ? assetChanged.join(', ') : 'none'}`);
console.log(`_astro assets with same size but different content: ${assetContentChanged.length ? assetContentChanged.join(', ') : 'none'}`);
console.log(`_astro assets not compared (duplicate stem): ${assetAmbiguous.length ? assetAmbiguous.join(', ') : 'none'}`);
const dump = (title, map, limit) => {
  if (!map.size) return;
  console.log(`\n${title}`);
  for (const [k, v] of [...map].sort((p, q) => q[1].n - p[1].n).slice(0, limit))
    console.log(`  ${String(v.n).padStart(6)}  ${k}${v.samples.length ? `\n${v.samples.map((s) => '          ' + s).join('\n')}` : ''}`);
};
dump('whitespace between tags (occurrences, context):', wsCtx, 15);
dump('text with changed surrounding whitespace (occurrences, element):', textWsCtx, 10);
if (structural.length) {
  console.log('\nstructural mismatches (first per page, distinct by tag sequence):');
  const seen = new Set();
  const tags = (c) => (c.match(/<\/?[a-zA-Z0-9-]+/g) ?? []).join(' ');
  for (const s of structural) {
    const key = tags(s.a) + '|' + tags(s.b);
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`--- ${s.rel}\n  base: ${JSON.stringify(s.a.slice(0, 300))}\n  new:  ${JSON.stringify(s.b.slice(0, 300))}`);
  }
}
