/**
 * OG画像用フォントのサブセット生成スクリプト
 *
 * Gen Interface JP の公式リリースzipから Regular / SemiBold を取り出し、
 * OG画像で実際に使う文字だけに絞ったTTFを src/assets/og/ に書き出す。
 *
 * 収録文字は og-font-chars.txt に1行で書き出し、
 * サブセット化（pyftsubset --text-file）とビルド時の文字カバレッジ照合の両方がこれを読む。
 * 最終的な中身は、サブセット後のTTFが実際に持つ文字だけに絞られる。
 *
 * 必要なもの: pyftsubset（pip install fonttools）
 *
 * Usage: pnpm og:font
 */
import { execFileSync } from 'node:child_process';
import { existsSync, globSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Gen Interface JP を更新するときは src/components/Head.astro のCDN版数とこの定数を同時に上げる
const FONT_VERSION = '0.8.0';

const FONT_ZIP_URL = `https://github.com/yamatoiizuka/gen-interface-jp/releases/download/v${FONT_VERSION}/GenInterfaceJP-${FONT_VERSION}.zip`;
const UNIHAN_ZIP_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = resolve(__dirname, '..');
const CACHE_DIR = resolve(DOCS_ROOT, '.cache/gen-interface-jp');
const EXTRACT_DIR = resolve(CACHE_DIR, 'extracted');
const CONTENT_DIR = resolve(DOCS_ROOT, 'src/content');
const OUTPUT_DIR = resolve(DOCS_ROOT, 'src/assets/og');

const FONT_ZIP_PATH = resolve(CACHE_DIR, `GenInterfaceJP-${FONT_VERSION}.zip`);
const UNIHAN_ZIP_PATH = resolve(CACHE_DIR, 'Unihan.zip');
const CHARS_PATH = resolve(OUTPUT_DIR, 'og-font-chars.txt');
const LICENSE_PATH = resolve(OUTPUT_DIR, 'OFL-gen-interface-jp.txt');

// zip内のパス。見出し用の "Gen Interface JP Display" は使わない（サイト本体の --ff--base が標準ファミリーのため）
const ZIP_FAMILY_DIR = `GenInterfaceJP-${FONT_VERSION}/Gen Interface JP`;
const ZIP_LICENSE_ENTRY = `GenInterfaceJP-${FONT_VERSION}/OFL.txt`;

const SUBSET_TARGETS = [
  { source: 'GenInterfaceJP-Regular.ttf', output: 'gen-interface-jp-400.ttf' },
  { source: 'GenInterfaceJP-SemiBold.ttf', output: 'gen-interface-jp-600.ttf' },
];

/** 常に収録するUnicode範囲（ASCII・約物・記号・かな・全角形など） */
const UNICODE_RANGES: [number, number][] = [
  [0x0020, 0x007f],
  [0x00a0, 0x00ff],
  [0x2000, 0x206f],
  [0x2070, 0x209f],
  [0x2100, 0x214f],
  [0x2190, 0x21ff],
  [0x2200, 0x22ff],
  [0x25a0, 0x25ff],
  [0x2600, 0x26ff],
  [0x3000, 0x303f],
  [0x3040, 0x309f],
  [0x30a0, 0x30ff],
  [0x31f0, 0x31ff],
  [0xff00, 0xffef],
];

// kJoyoKanji / kJinmeiyoKanji の収録ファイルはUCDの版によって変わるため、候補を順に探す
const UNIHAN_ENTRIES = ['Unihan_OtherMappings.txt', 'Unihan_DictionaryLikeData.txt'];

/** キャッシュが無いときだけダウンロードする */
async function downloadIfMissing(url: string, destPath: string): Promise<void> {
  if (existsSync(destPath)) return;

  console.log(`↓ ダウンロード中: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ダウンロードに失敗しました（HTTP ${res.status}）: ${url}`);

  // 中断時に壊れたファイルをキャッシュとして残さないよう、一時ファイルに書いてから差し替える
  const tmpPath = `${destPath}.part`;
  writeFileSync(tmpPath, Buffer.from(await res.arrayBuffer()));
  renameSync(tmpPath, destPath);
}

/** zip内の1エントリを destDir 直下に展開する */
function extractEntry(zipPath: string, entry: string, destDir: string): void {
  execFileSync('unzip', ['-o', '-j', zipPath, entry, '-d', destDir], { stdio: 'pipe' });
}

/** 常用漢字・人名用漢字の一覧を Unihan から作る */
function collectKanji(): Set<string> {
  const kanji = new Set<string>();

  for (const entry of UNIHAN_ENTRIES) {
    let text: string;
    try {
      text = execFileSync('unzip', ['-p', UNIHAN_ZIP_PATH, entry], { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
    } catch {
      continue;
    }
    for (const line of text.split('\n')) {
      const matched = /^U\+([0-9A-F]+)\t(?:kJoyoKanji|kJinmeiyoKanji)\t/.exec(line);
      if (matched) kanji.add(String.fromCodePoint(parseInt(matched[1], 16)));
    }
  }

  if (kanji.size === 0) {
    throw new Error(`Unihan.zip から kJoyoKanji / kJinmeiyoKanji を取得できませんでした（探索対象: ${UNIHAN_ENTRIES.join(', ')}）`);
  }
  return kanji;
}

/** frontmatter の title / description の値を取り出す（前後の引用符は外す） */
function extractFrontmatterText(source: string): string[] {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!frontmatter) return [];

  const values: string[] = [];
  for (const key of ['title', 'description']) {
    const matched = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(frontmatter[1]);
    if (!matched) continue;
    values.push(matched[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2'));
  }
  return values;
}

/** ドキュメント本文（下書き・デモも含む全MDX）のタイトル・説明文で使われている文字 */
function collectContentChars(): { chars: Set<string>; fileCount: number } {
  const chars = new Set<string>();
  const files = globSync(['ja/**/*.mdx', 'en/**/*.mdx'], { cwd: CONTENT_DIR });

  for (const file of files) {
    for (const value of extractFrontmatterText(readFileSync(resolve(CONTENT_DIR, file), 'utf-8'))) {
      for (const char of value) chars.add(char);
    }
  }
  return { chars, fileCount: files.length };
}

function assertFontTools(): void {
  for (const command of ['pyftsubset', 'fonttools']) {
    try {
      execFileSync(command, ['--help'], { stdio: 'ignore' });
    } catch {
      console.error(`${command} が見つかりません。fonttools をインストールしてください:\n  pip install fonttools`);
      process.exit(1);
    }
  }
}

/** サブセット後のTTFが実際に持つ文字を cmap から読む */
function readCoveredChars(fontPath: string): Set<string> {
  const xml = execFileSync('fonttools', ['ttx', '-t', 'cmap', '-o', '-', fontPath], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  const covered = new Set<string>();
  for (const [, code] of xml.matchAll(/code="0x([0-9a-fA-F]+)"/g)) {
    covered.add(String.fromCodePoint(parseInt(code, 16)));
  }
  return covered;
}

// --- メイン処理 ---
assertFontTools();
mkdirSync(CACHE_DIR, { recursive: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

await downloadIfMissing(FONT_ZIP_URL, FONT_ZIP_PATH);
await downloadIfMissing(UNIHAN_ZIP_URL, UNIHAN_ZIP_PATH);

for (const { source } of SUBSET_TARGETS) {
  extractEntry(FONT_ZIP_PATH, `${ZIP_FAMILY_DIR}/${source}`, EXTRACT_DIR);
}
extractEntry(FONT_ZIP_PATH, ZIP_LICENSE_ENTRY, EXTRACT_DIR);

const kanji = collectKanji();
const { chars: contentChars, fileCount } = collectContentChars();

const charSet = new Set<string>();
for (const [start, end] of UNICODE_RANGES) {
  for (let code = start; code <= end; code++) charSet.add(String.fromCodePoint(code));
}
for (const char of kanji) charSet.add(char);
for (const char of contentChars) charSet.add(char);

// 制御文字はテキストファイルに置けないので除外する（U+007F など）
const sortedChars = [...charSet].filter((char) => !/^[\p{Cc}]$/u.test(char)).sort((a, b) => a.codePointAt(0)! - b.codePointAt(0)!);

// pyftsubset の --text-file 用にまず候補集合を書く。改行を含めず1行にする
writeFileSync(CHARS_PATH, sortedChars.join(''), 'utf-8');

for (const { source, output } of SUBSET_TARGETS) {
  execFileSync(
    'pyftsubset',
    [
      resolve(EXTRACT_DIR, source),
      `--output-file=${resolve(OUTPUT_DIR, output)}`,
      `--text-file=${CHARS_PATH}`,
      '--no-hinting',
      '--desubroutinize',
      '--layout-features=*',
      '--drop-tables+=DSIG',
    ],
    { stdio: 'inherit' }
  );
}

// pyftsubset は元フォントに無い文字を落とすため、chars.txt を実際のcmapに合わせて絞り直す。
// 絞らないと、フォントに無い文字をカバレッジ照合が「収録済み」と誤判定して空白で描かれてしまう
const coveredChars = SUBSET_TARGETS.map(({ output }) => readCoveredChars(resolve(OUTPUT_DIR, output))).reduce(
  (a, b) => new Set([...a].filter((char) => b.has(char)))
);
const finalChars = sortedChars.filter((char) => coveredChars.has(char));
writeFileSync(CHARS_PATH, finalChars.join(''), 'utf-8');

// OFL-1.1 はフォント再配布時にライセンスの同梱が必要。
// copyFileSync だとzip由来のパーミッション（600）を引き継ぐため、読み直して書き出す
writeFileSync(LICENSE_PATH, readFileSync(resolve(EXTRACT_DIR, 'OFL.txt')));

const kb = (path: string) => `${Math.round(statSync(path).size / 1024).toLocaleString()} KB`;

console.log(
  `✔ 収録文字 ${finalChars.length} 字（候補 ${sortedChars.length} 字のうちフォントに無い ${sortedChars.length - finalChars.length} 字を除外 / 漢字 ${kanji.size} 字 / MDX ${fileCount} ファイル由来 ${contentChars.size} 字）`
);
for (const { output } of SUBSET_TARGETS) {
  console.log(`✔ ${output}（${kb(resolve(OUTPUT_DIR, output))}）`);
}
console.log('✔ og-font-chars.txt / OFL-gen-interface-jp.txt を出力しました');
