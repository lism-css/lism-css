/**
 * テンプレートのスクリーンショット自動生成スクリプト
 *
 * ビルド後のdistディレクトリからプレビューサーバーを起動し、
 * 各テンプレートページのスクリーンショットを撮影して保存します。
 *
 * 使い方:
 *   npx tsx scripts/generate-screenshots.ts         # 新規のみ生成
 *   npx tsx scripts/generate-screenshots.ts --force # 全て再生成
 */

import { chromium, type Browser, type Page } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';

// 現在のディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// 設定
const CONFIG = {
	// スクリーンショットの保存先
	outputDir: join(ROOT_DIR, 'public', 'screenshots', 'templates'),
	// ビューポートサイズ（3:2比率）
	viewport: { width: 1200, height: 800 },
	// プレビューサーバーのポート
	port: 4000,
	// ページ読み込み後の待機時間（ミリ秒）
	waitAfterLoad: 500,
};

// コマンドライン引数をパース
const args = process.argv.slice(2);
const forceRegenerate = args.includes('--force');

/**
 * テンプレート設定からパス一覧を動的に取得
 */
async function getTemplatePaths(): Promise<Array<{ category: string; id: string }>> {
	// templates.ts から動的にインポート
	const templatesModule = await import('../src/config/templates.ts');
	return templatesModule.getAllTemplatePaths();
}

/**
 * URLにアクセスしてサーバーが応答するか確認
 */
async function waitForServer(url: string, maxRetries = 30, interval = 500): Promise<boolean> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const response = await fetch(url);
			if (response.ok) {
				return true;
			}
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
		});

		let started = false;

		// サーバー起動を検出
		server.stdout?.on('data', (data: Buffer) => {
			const output = data.toString();
			if (output.includes('localhost') && !started) {
				started = true;
				// サーバーが本当に応答可能になるまで待機
				waitForServer(`http://localhost:${CONFIG.port}/`).then((ready) => {
					if (ready) {
						console.log(`✅ プレビューサーバー起動完了 (port: ${CONFIG.port})`);
						resolve(server);
					} else {
						server.kill();
						reject(new Error('サーバーが応答しません'));
					}
				});
			}
		});

		server.stderr?.on('data', (data: Buffer) => {
			const output = data.toString();
			// エラーではなく情報メッセージの場合もあるので、起動検出に使う
			if (output.includes('localhost') && !started) {
				started = true;
				waitForServer(`http://localhost:${CONFIG.port}/`).then((ready) => {
					if (ready) {
						console.log(`✅ プレビューサーバー起動完了 (port: ${CONFIG.port})`);
						resolve(server);
					} else {
						server.kill();
						reject(new Error('サーバーが応答しません'));
					}
				});
			}
		});

		server.on('error', (err) => {
			reject(new Error(`サーバー起動エラー: ${err.message}`));
		});

		// タイムアウト処理
		setTimeout(() => {
			if (!started) {
				server.kill();
				reject(new Error('サーバー起動タイムアウト'));
			}
		}, 30000);
	});
}

/**
 * スクリーンショットを撮影
 */
async function takeScreenshot(page: Page, category: string, id: string): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
	const outputPath = join(CONFIG.outputDir, category, `${id}.png`);

	// 強制再生成でない場合、既存ファイルをスキップ
	if (!forceRegenerate && existsSync(outputPath)) {
		return { success: true, skipped: true };
	}

	// 出力ディレクトリを作成
	const outputDir = dirname(outputPath);
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	try {
		const url = `http://localhost:${CONFIG.port}/preview/templates/${category}/${id}/`;
		await page.goto(url, { waitUntil: 'networkidle' });

		// 画像やフォントの読み込み完了を待つ
		await page.waitForTimeout(CONFIG.waitAfterLoad);

		// スクリーンショットを撮影
		await page.screenshot({
			path: outputPath,
			type: 'png',
		});

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * メイン処理
 */
async function main() {
	console.log('🖼️  テンプレートスクリーンショット生成');
	console.log(`   モード: ${forceRegenerate ? '全て再生成' : '新規のみ'}`);
	console.log('');

	// distディレクトリの存在確認
	const distDir = join(ROOT_DIR, 'dist');
	if (!existsSync(distDir)) {
		console.error('❌ distディレクトリが見つかりません。先にビルドを実行してください。');
		console.error('   npm run build:astro');
		process.exit(1);
	}

	// テンプレートパスを取得
	const templatePaths = await getTemplatePaths();
	console.log(`📋 対象テンプレート数: ${templatePaths.length}`);
	console.log('');

	// プレビューサーバーを起動
	let server: ChildProcess | null = null;
	let browser: Browser | null = null;

	try {
		server = await startPreviewServer();

		// Playwrightブラウザを起動
		console.log('🌐 ブラウザを起動中...');
		browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();
		await page.setViewportSize(CONFIG.viewport);
		console.log('✅ ブラウザ起動完了');
		console.log('');

		// 統計
		let generated = 0;
		let skipped = 0;
		let failed = 0;

		// 各テンプレートのスクリーンショットを撮影
		console.log('📸 スクリーンショット撮影開始...');
		for (const { category, id } of templatePaths) {
			const result = await takeScreenshot(page, category, id);

			if (result.skipped) {
				skipped++;
				process.stdout.write(`  ⏭️  ${category}/${id} (スキップ)\n`);
			} else if (result.success) {
				generated++;
				process.stdout.write(`  ✅ ${category}/${id}\n`);
			} else {
				failed++;
				process.stdout.write(`  ❌ ${category}/${id}: ${result.error}\n`);
			}
		}

		// 結果サマリー
		console.log('');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('📊 結果サマリー');
		console.log(`   生成: ${generated}`);
		console.log(`   スキップ: ${skipped}`);
		console.log(`   失敗: ${failed}`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		if (failed > 0) {
			process.exit(1);
		}
	} finally {
		// クリーンアップ
		if (browser) {
			await browser.close();
			console.log('🌐 ブラウザを終了');
		}
		if (server) {
			server.kill();
			console.log('📡 プレビューサーバーを停止');
		}
	}
}

// 実行
main().catch((error) => {
	console.error('❌ エラー:', error);
	process.exit(1);
});
