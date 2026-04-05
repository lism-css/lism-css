/**
 * スクリーンショット更新スクリプト
 *
 * compare で検出された差分テンプレートのみを対象に、
 * 比較用ベースライン（グレー差し替え）と公開用スクリーンショット（本番画像）を更新します。
 *
 * 使い方:
 *   npx tsx scripts/update-screenshots.ts    # diff/ にある差分テンプレートを更新
 */

import { chromium, type Browser, type Page } from 'playwright';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const CONFIG = {
  // 比較用ベースライン（グレー差し替え画像）
  baselineDir: join(ROOT_DIR, '_screenshots', 'baseline'),
  diffDir: join(ROOT_DIR, '_screenshots', 'diff'),
  tempDir: join(ROOT_DIR, '_screenshots', 'temp'),
  // 公開用スクリーンショット（本番画像）
  publicDir: join(ROOT_DIR, 'public', 'screenshots', 'templates'),
  viewport: { width: 1200, height: 800 },
  port: 4000,
  waitAfterLoad: 500,
};

/**
 * _screenshots/diff/ から差分があるテンプレート一覧を取得
 */
function getDiffTemplatePaths(): Array<{ category: string; id: string }> {
  if (!existsSync(CONFIG.diffDir)) {
    return [];
  }

  const paths: Array<{ category: string; id: string }> = [];
  const entries = readdirSync(CONFIG.diffDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const category = entry.name;
    const files = readdirSync(join(CONFIG.diffDir, category));
    for (const file of files) {
      if (file.endsWith('.png')) {
        paths.push({ category, id: basename(file, '.png') });
      }
    }
  }

  return paths;
}

/**
 * URLにアクセスしてサーバーが応答するか確認
 */
async function waitForServer(url: string, maxRetries = 30, interval = 500): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // サーバーがまだ起動していない
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

/**
 * プレビューサーバーを起動
 */
function startPreviewServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    console.log('📡 プレビューサーバーを起動中...');

    const server = spawn('npx', ['astro', 'preview', '--port', String(CONFIG.port)], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      detached: true,
    });

    let started = false;

    const onServerOutput = (data: Buffer) => {
      const output = data.toString();
      if (output.includes('localhost') && !started) {
        started = true;
        void waitForServer(`http://localhost:${CONFIG.port}/`).then((ready) => {
          if (ready) {
            console.log(`✅ プレビューサーバー起動完了 (port: ${CONFIG.port})`);
            resolve(server);
          } else {
            server.kill();
            reject(new Error('サーバーが応答しません'));
          }
        });
      }
    };

    server.stdout?.on('data', onServerOutput);
    server.stderr?.on('data', onServerOutput);

    server.on('error', (err) => {
      reject(new Error(`サーバー起動エラー: ${err.message}`));
    });

    setTimeout(() => {
      if (!started) {
        server.kill();
        reject(new Error('サーバー起動タイムアウト'));
      }
    }, 30000);
  });
}

/**
 * 1x1 グレーPNGバッファ（ランダム画像の代替用）
 */
function createGrayPixelPng(): Buffer {
  const png = new PNG({ width: 1, height: 1 });
  png.data[0] = 190;
  png.data[1] = 190;
  png.data[2] = 190;
  png.data[3] = 255;
  return PNG.sync.write(png);
}

/**
 * ランダム画像をグレーに差し替えるルートを設定
 */
async function setupImageInterception(page: Page, grayPng: Buffer): Promise<void> {
  await page.route('**/cdn.lism-css.com/random/img*', (route) => {
    return route.fulfill({
      contentType: 'image/png',
      body: grayPng,
    });
  });
}

/**
 * スクリーンショットを撮影して保存
 */
async function captureScreenshot(page: Page, outputDir: string, category: string, id: string): Promise<boolean> {
  const outputPath = join(outputDir, category, `${id}.png`);
  const dir = dirname(outputPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  try {
    const url = `http://localhost:${CONFIG.port}/preview/templates/${category}/${id}/`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(CONFIG.waitAfterLoad);
    await page.screenshot({ path: outputPath, type: 'png' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔄 スクリーンショット更新');
  console.log('');

  // dist チェック
  if (!existsSync(join(ROOT_DIR, 'dist'))) {
    console.error('❌ distディレクトリが見つかりません。先にビルドを実行してください。');
    console.error('   pnpm build:astro');
    process.exit(1);
  }

  // 差分テンプレートを取得
  const templatePaths = getDiffTemplatePaths();
  if (templatePaths.length === 0) {
    console.log('✅ 差分テンプレートがありません。更新は不要です。');
    process.exit(0);
  }

  console.log(`📋 更新対象: ${templatePaths.length}件`);
  for (const { category, id } of templatePaths) {
    console.log(`   - ${category}/${id}`);
  }
  console.log('');

  let server: ChildProcess | null = null;
  let browser: Browser | null = null;
  let exitCode = 0;

  try {
    server = await startPreviewServer();

    console.log('🌐 ブラウザを起動中...');
    browser = await chromium.launch({ headless: true });

    // ページ1: グレー差し替えあり（比較用ベースライン更新）
    const grayPage = await browser.newPage();
    await grayPage.setViewportSize(CONFIG.viewport);
    await setupImageInterception(grayPage, createGrayPixelPng());

    // ページ2: グレー差し替えなし（公開用スクリーンショット更新）
    const realPage = await browser.newPage();
    await realPage.setViewportSize(CONFIG.viewport);

    console.log('✅ ブラウザ起動完了');
    console.log('');

    let updated = 0;
    let failed = 0;

    console.log('📸 撮影・更新開始...');
    for (const { category, id } of templatePaths) {
      const name = `${category}/${id}`;

      // 比較用ベースラインを更新（グレー差し替えあり）
      const baselineOk = await captureScreenshot(grayPage, CONFIG.baselineDir, category, id);
      // 公開用スクリーンショットを更新（本番画像）
      const publicOk = await captureScreenshot(realPage, CONFIG.publicDir, category, id);

      if (baselineOk && publicOk) {
        updated++;
        process.stdout.write(`  ✅ ${name}\n`);
      } else {
        failed++;
        const details = !baselineOk && !publicOk ? 'baseline・public' : !baselineOk ? 'baseline' : 'public';
        process.stdout.write(`  ❌ ${name} (${details}の撮影失敗)\n`);
      }
    }

    // diff・temp ディレクトリをクリーンアップ
    if (existsSync(CONFIG.diffDir)) rmSync(CONFIG.diffDir, { recursive: true });
    if (existsSync(CONFIG.tempDir)) rmSync(CONFIG.tempDir, { recursive: true });

    // サマリー
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 結果サマリー');
    console.log(`   更新: ${updated}`);
    if (failed > 0) console.log(`   失敗: ${failed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (failed > 0) exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🌐 ブラウザを終了');
    }
    if (server) {
      if (server.pid) process.kill(-server.pid, 'SIGTERM');
      else server.kill();
      console.log('📡 プレビューサーバーを停止');
    }
    process.exit(exitCode);
  }
}

main().catch((error) => {
  console.error('❌ エラー:', error);
  process.exit(1);
});
