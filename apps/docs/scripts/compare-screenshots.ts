/**
 * テンプレートのスクリーンショット比較スクリプト
 *
 * CDNのランダム画像をグレーのプレースホルダーに差し替えた上で撮影し、
 * ベースライン画像とピクセル比較してレイアウト差分を検出します。
 *
 * 使い方:
 *   npx tsx scripts/compare-screenshots.ts                    # 比較（初回はベースライン生成）
 *   npx tsx scripts/compare-screenshots.ts --update           # 差分があるベースラインを更新
 *   npx tsx scripts/compare-screenshots.ts --threshold 0.5    # 差分率しきい値を変更（デフォルト: 0.1%）
 *   npx tsx scripts/compare-screenshots.ts cta                # カテゴリ指定
 *   npx tsx scripts/compare-screenshots.ts cta/cta001         # テンプレート指定
 */

import { chromium, type Browser, type Page } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const CONFIG = {
	// 比較用ベースライン（Git管理対象）
	baselineDir: join(ROOT_DIR, '_screenshots', 'baseline'),
	tempDir: join(ROOT_DIR, '_screenshots', 'temp'),
	diffDir: join(ROOT_DIR, '_screenshots', 'diff'),
	viewport: { width: 1200, height: 800 },
	port: 4000,
	waitAfterLoad: 500,
};

// コマンドライン引数をパース
const args = process.argv.slice(2);
const shouldUpdate = args.includes('--update');
const thresholdIndex = args.indexOf('--threshold');
// 差分率しきい値（%）: これ以下の差分は無視する
const threshold = thresholdIndex !== -1 ? parseFloat(args[thresholdIndex + 1]) : 0.1;
// --force, --update, --threshold とその値を除いた残りをフィルタとして使用
const filters = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--threshold');

/**
 * フィルタ引数でテンプレートを絞り込む
 * "cta" → カテゴリ全体, "cta/cta001" → 特定テンプレート
 */
function filterTemplatePaths(paths: Array<{ category: string; id: string }>): Array<{ category: string; id: string }> {
	if (filters.length === 0) return paths;
	return paths.filter(({ category, id }) =>
		filters.some((f) => {
			if (f.includes('/')) return `${category}/${id}` === f;
			return category === f;
		})
	);
}

type CompareResult =
	| { status: 'unchanged' }
	| { status: 'changed'; diffPercent: number; diffPath: string }
	| { status: 'new' }
	| { status: 'error'; message: string };

/**
 * 1x1 グレーPNGバッファを生成（ランダム画像の代替用）
 */
function createGrayPixelPng(): Buffer {
	const png = new PNG({ width: 1, height: 1 });
	// RGBA: グレー(190, 190, 190, 255)
	png.data[0] = 190;
	png.data[1] = 190;
	png.data[2] = 190;
	png.data[3] = 255;
	return PNG.sync.write(png);
}

/**
 * テンプレート設定からパス一覧を取得（draft除外）
 */
async function getTemplatePaths(): Promise<Array<{ category: string; id: string }>> {
	const { templates } = await import('../src/config/templates.ts');
	const paths: Array<{ category: string; id: string }> = [];
	for (const [categoryId, category] of Object.entries(templates)) {
		for (const item of category.items) {
			if (!item.draft) {
				paths.push({ category: categoryId, id: item.id });
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
 * ランダム画像をグレーに差し替えるルートを設定
 */
async function setupImageInterception(page: Page, grayPng: Buffer): Promise<void> {
	await page.route('**/cdn.lism-css.com/img/random-*', (route) => {
		return route.fulfill({
			contentType: 'image/png',
			body: grayPng,
		});
	});
}

/**
 * スクリーンショットを撮影して指定ディレクトリに保存
 */
async function captureScreenshot(page: Page, outputDir: string, category: string, id: string): Promise<string | null> {
	const outputPath = join(outputDir, category, `${id}.png`);
	const dir = dirname(outputPath);

	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	try {
		const url = `http://localhost:${CONFIG.port}/preview/templates/${category}/${id}/`;
		await page.goto(url, { waitUntil: 'networkidle' });
		await page.waitForTimeout(CONFIG.waitAfterLoad);
		await page.screenshot({ path: outputPath, type: 'png' });
		return outputPath;
	} catch {
		return null;
	}
}

/**
 * 2つのPNG画像をピクセル比較し、差分画像を出力
 */
function compareImages(baselinePath: string, newPath: string, diffPath: string): { diffPercent: number } {
	const baselinePng = PNG.sync.read(readFileSync(baselinePath));
	const newPng = PNG.sync.read(readFileSync(newPath));

	// サイズが異なる場合は100%差分とする
	if (baselinePng.width !== newPng.width || baselinePng.height !== newPng.height) {
		return { diffPercent: 100 };
	}

	const { width, height } = baselinePng;
	const diff = new PNG({ width, height });

	const diffPixels = pixelmatch(baselinePng.data, newPng.data, diff.data, width, height, {
		// アンチエイリアス差分を許容
		threshold: 0.3,
	});

	const totalPixels = width * height;
	const diffPercent = (diffPixels / totalPixels) * 100;

	// 差分画像を保存（差分がある場合のみ）
	if (diffPercent > 0) {
		const diffDirPath = dirname(diffPath);
		if (!existsSync(diffDirPath)) {
			mkdirSync(diffDirPath, { recursive: true });
		}
		writeFileSync(diffPath, PNG.sync.write(diff));
	}

	return { diffPercent };
}

/**
 * 1テンプレートの撮影→比較
 */
async function processTemplate(page: Page, category: string, id: string, isInitialRun: boolean): Promise<CompareResult> {
	const baselinePath = join(CONFIG.baselineDir, category, `${id}.png`);
	const diffPath = join(CONFIG.diffDir, category, `${id}.png`);

	if (isInitialRun) {
		// 初回: ベースラインを生成
		const result = await captureScreenshot(page, CONFIG.baselineDir, category, id);
		if (!result) {
			return { status: 'error', message: 'スクリーンショット撮影失敗' };
		}
		return { status: 'new' };
	}

	// 2回目以降: 一時ディレクトリに撮影 → ベースラインと比較
	const tempPath = await captureScreenshot(page, CONFIG.tempDir, category, id);
	if (!tempPath) {
		return { status: 'error', message: 'スクリーンショット撮影失敗' };
	}

	// ベースラインがない場合 → 新規
	if (!existsSync(baselinePath)) {
		// ベースラインとして保存
		const dir = dirname(baselinePath);
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
		writeFileSync(baselinePath, readFileSync(tempPath));
		return { status: 'new' };
	}

	// ピクセル比較
	const { diffPercent } = compareImages(baselinePath, tempPath, diffPath);

	if (diffPercent <= threshold) {
		return { status: 'unchanged' };
	}

	// --update: ベースラインを更新
	if (shouldUpdate) {
		writeFileSync(baselinePath, readFileSync(tempPath));
	}

	return {
		status: 'changed',
		diffPercent: Math.round(diffPercent * 100) / 100,
		diffPath,
	};
}

async function main() {
	console.log('🔍 テンプレートスクリーンショット比較');
	console.log(`   しきい値: ${threshold}%`);
	if (shouldUpdate) {
		console.log('   モード: 差分があるベースラインを更新');
	}
	console.log('');

	// dist ディレクトリの存在確認
	const distDir = join(ROOT_DIR, 'dist');
	if (!existsSync(distDir)) {
		console.error('❌ distディレクトリが見つかりません。先にビルドを実行してください。');
		console.error('   pnpm build');
		process.exit(1);
	}

	const allPaths = await getTemplatePaths();
	const templatePaths = filterTemplatePaths(allPaths);
	if (filters.length > 0) {
		console.log(`   フィルタ: ${filters.join(', ')}`);
	}
	console.log(`📋 対象テンプレート数: ${templatePaths.length}`);

	// ベースラインの有無で初回かどうか判定
	const isInitialRun = !existsSync(CONFIG.baselineDir);
	if (isInitialRun) {
		console.log('📌 ベースラインが存在しません。初回撮影を実行します。');
		mkdirSync(CONFIG.baselineDir, { recursive: true });
	} else {
		// 差分ディレクトリを初期化
		if (existsSync(CONFIG.diffDir)) rmSync(CONFIG.diffDir, { recursive: true });
		mkdirSync(CONFIG.diffDir, { recursive: true });
		// 一時ディレクトリを初期化
		if (existsSync(CONFIG.tempDir)) rmSync(CONFIG.tempDir, { recursive: true });
		mkdirSync(CONFIG.tempDir, { recursive: true });
	}
	console.log('');

	let server: ChildProcess | null = null;
	let browser: Browser | null = null;

	try {
		server = await startPreviewServer();

		console.log('🌐 ブラウザを起動中...');
		browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();
		await page.setViewportSize(CONFIG.viewport);

		// ランダム画像をグレーに差し替え
		const grayPng = createGrayPixelPng();
		await setupImageInterception(page, grayPng);

		console.log('✅ ブラウザ起動完了（ランダム画像 → グレーに固定）');
		console.log('');

		// 統計
		let unchanged = 0;
		let changed = 0;
		let newCount = 0;
		let errors = 0;
		const changedItems: Array<{ name: string; diffPercent: number; diffPath: string }> = [];

		console.log(isInitialRun ? '📸 ベースライン撮影開始...' : '📸 撮影・比較開始...');
		for (const { category, id } of templatePaths) {
			const name = `${category}/${id}`;
			const result = await processTemplate(page, category, id, isInitialRun);

			switch (result.status) {
				case 'unchanged':
					unchanged++;
					process.stdout.write(`  ✅ ${name} (変更なし)\n`);
					break;
				case 'changed':
					changed++;
					changedItems.push({ name, diffPercent: result.diffPercent, diffPath: result.diffPath });
					process.stdout.write(`  ⚠️  ${name} (差分: ${result.diffPercent}%)\n`);
					break;
				case 'new':
					newCount++;
					process.stdout.write(isInitialRun ? `  📸 ${name}\n` : `  🆕 ${name} (新規)\n`);
					break;
				case 'error':
					errors++;
					process.stdout.write(`  ❌ ${name}: ${result.message}\n`);
					break;
			}
		}

		// 結果サマリー
		console.log('');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		if (isInitialRun) {
			console.log(`📊 ベースライン生成完了: ${newCount}件`);
			console.log(`   保存先: ${CONFIG.baselineDir}`);
		} else {
			console.log('📊 結果サマリー');
			console.log(`   変更なし: ${unchanged}`);
			console.log(`   変更あり: ${changed}`);
			if (newCount > 0) console.log(`   新規: ${newCount}`);
			if (errors > 0) console.log(`   エラー: ${errors}`);
		}
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		// 変更があった場合の詳細
		if (changedItems.length > 0) {
			console.log('');
			console.log('⚠️  変更があったテンプレート:');
			for (const item of changedItems) {
				console.log(`   - ${item.name} (${item.diffPercent}%)`);
				console.log(`     差分画像: ${item.diffPath}`);
			}
			if (shouldUpdate) {
				console.log('');
				console.log('✅ ベースラインを更新しました。');
			}
		}

		// 一時ディレクトリを削除
		if (existsSync(CONFIG.tempDir)) {
			rmSync(CONFIG.tempDir, { recursive: true });
		}

		// 比較モードで変更・エラーがあった場合は終了コード1
		if (!isInitialRun && (changed > 0 || errors > 0)) {
			process.exit(1);
		}
	} finally {
		if (browser) {
			await browser.close();
			console.log('🌐 ブラウザを終了');
		}
		if (server) {
			// shell: true で起動したためプロセスグループごと終了させる
			if (server.pid) process.kill(-server.pid, 'SIGTERM');
			else server.kill();
			console.log('📡 プレビューサーバーを停止');
		}
		process.exit(0);
	}
}

main().catch((error) => {
	console.error('❌ エラー:', error);
	process.exit(1);
});
