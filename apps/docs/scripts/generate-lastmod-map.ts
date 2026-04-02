/**
 * lastmod-map.json 生成スクリプト
 *
 * git log から各コンテンツ・ページファイルの最終コミット日時を取得し、
 * サイトURL → ISO日時文字列 のマップを JSON ファイルに書き出す。
 *
 * Vercel 等の CI 環境では git 履歴が浅いため正確な lastmod が取れない。
 * そのため、ローカル（全履歴がある環境）でこのスクリプトを実行し、
 * 生成された JSON をコミットしておく。
 *
 * Usage: pnpm generate:lastmod
 */
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://lism-css.com';
const ROOT_LANG = 'ja';
// NOTE: siteConfig.langs と同期すること（言語追加時に更新が必要）
const NON_ROOT_LANGS = ['en'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = resolve(__dirname, '..');
const GIT_ROOT = resolve(DOCS_ROOT, '../..');
const OUTPUT_PATH = resolve(DOCS_ROOT, 'lastmod-map.json');

/**
 * git log を解析して ファイルパス→最終コミット日時 のマップを構築する
 * git log は新しい順に出力されるので、各ファイルについて最初に見つかった日時が最新
 */
function getGitLastModifiedMap(): Map<string, Date> {
  const fileToDate = new Map<string, Date>();

  const output = execSync("git log --pretty=format:'__COMMIT__%aI' --name-only -- 'apps/docs/src/content' 'apps/docs/src/pages'", {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    cwd: GIT_ROOT,
  });

  let currentDate: Date | null = null;
  for (const line of output.split('\n')) {
    if (line.startsWith('__COMMIT__')) {
      currentDate = new Date(line.slice('__COMMIT__'.length));
    } else if (line.trim() && currentDate) {
      const trimmed = line.trim();
      // 削除済みファイルを除外（git log には過去に存在したファイルも含まれるため）
      if (!fileToDate.has(trimmed) && existsSync(resolve(GIT_ROOT, trimmed))) {
        fileToDate.set(trimmed, currentDate);
      }
    }
  }

  return fileToDate;
}

/**
 * ファイルパス（git root 相対）をサイトのフルURL配列に変換
 *
 * コンテンツファイル（Astro glob loader が entry.id を小文字化するため slug も小文字化する）:
 *   apps/docs/src/content/ja/overview.mdx      → [https://lism-css.com/docs/overview/]
 *   apps/docs/src/content/ja/ui/Accordion.mdx   → [https://lism-css.com/docs/ui/accordion/, https://lism-css.com/ui/accordion/]
 *   apps/docs/src/content/en/overview.mdx       → [https://lism-css.com/en/docs/overview/]
 *
 * ページファイル:
 *   apps/docs/src/pages/index.astro             → [https://lism-css.com/]
 *   apps/docs/src/pages/templates/index.astro   → [https://lism-css.com/templates/]
 */
function filePathToSiteUrls(filePath: string): string[] {
  // _（アンダースコア開始）のパスは非公開ページ
  if (filePath.includes('/_')) return [];

  // コンテンツファイル
  const contentMatch = filePath.match(/^apps\/docs\/src\/content\/(\w+)\/(.+)\.mdx?$/);
  if (contentMatch) {
    const [, lang, rawSlug] = contentMatch;
    const slug = rawSlug.toLowerCase();
    const langPrefix = lang === ROOT_LANG ? '' : `/${lang}`;
    const urls = [`${SITE_URL}${langPrefix}/docs/${slug}/`];

    // ui/ コンテンツは /ui/{slug}/ ルートでも公開される（root言語のみ）
    if (lang === ROOT_LANG && slug.startsWith('ui/')) {
      urls.push(`${SITE_URL}/${slug}/`);
    }
    return urls;
  }

  // ページファイル
  const pageMatch = filePath.match(/^apps\/docs\/src\/pages\/(.+)\.astro$/);
  if (pageMatch) {
    const pagePath = pageMatch[1];

    // [lang]/index.astro → 非root言語のトップページ（/en/ 等）
    if (pagePath === '[lang]/index') {
      return NON_ROOT_LANGS.map((lang) => `${SITE_URL}/${lang}/`);
    }

    // その他の動的ルートはコンテンツ由来なのでスキップ
    if (pagePath.includes('[')) return [];

    // preview/templates/{cat}/{id}/index.astro → 対応するテンプレート詳細ページにもマップ
    const previewMatch = pagePath.match(/^preview\/templates\/(.+)\/index$/);
    if (previewMatch) {
      const templatePath = previewMatch[1];
      return [`${SITE_URL}/preview/templates/${templatePath}/`, `${SITE_URL}/templates/${templatePath}/`];
    }

    // index.astro → ディレクトリURL（ルートの index も正しく処理）
    const urlPath = pagePath.replace(/(^|\/)index$/, '');
    return [`${SITE_URL}/${urlPath}${urlPath ? '/' : ''}`];
  }

  return [];
}

// --- メイン処理 ---
const fileToDate = getGitLastModifiedMap();
const urlToDate: Record<string, string> = {};

for (const [filePath, date] of fileToDate) {
  const urls = filePathToSiteUrls(filePath);
  for (const url of urls) {
    // 同一URLが複数ファイルにマッチする場合は最初（最新）を優先
    if (!urlToDate[url]) {
      urlToDate[url] = date.toISOString();
    }
  }
}

// URLのアルファベット順でソートして書き出し（差分を見やすくする）
const sorted = Object.fromEntries(Object.entries(urlToDate).sort(([a], [b]) => a.localeCompare(b)));

writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');

const count = Object.keys(sorted).length;
console.log(`✔ lastmod-map.json を生成しました（${count} URL）`);
