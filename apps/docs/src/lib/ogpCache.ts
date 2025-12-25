/**
 * OGPデータのキャッシュ管理
 * 外部サイトのOGP情報をローカルにキャッシュして、
 * ビルド時間の短縮と外部サイトへの負荷軽減を実現
 */
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

// キャッシュディレクトリのパス
const CACHE_DIR = '.cache/ogp';

// キャッシュの有効期限（ミリ秒）- デフォルト7日間
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * OGPデータの型定義
 */
export interface OgpData {
	title: string;
	description: string;
	image: string;
	siteName: string;
	favicon: string;
}

/**
 * キャッシュデータの型定義（メタデータ含む）
 */
interface CacheEntry {
	data: OgpData;
	fetchedAt: number; // キャッシュ作成時のタイムスタンプ
	url: string;
}

/**
 * URLからキャッシュキー（ハッシュ）を生成
 */
function generateCacheKey(url: string): string {
	return createHash('md5').update(url).digest('hex');
}

/**
 * キャッシュファイルのパスを取得
 */
function getCachePath(cacheKey: string): string {
	return join(CACHE_DIR, `${cacheKey}.json`);
}

/**
 * キャッシュからOGPデータを取得
 * @returns キャッシュが有効であればOGPデータ、なければnull
 */
export function getOgpFromCache(url: string): OgpData | null {
	const cacheKey = generateCacheKey(url);
	const cachePath = getCachePath(cacheKey);

	if (!existsSync(cachePath)) {
		return null;
	}

	try {
		const cacheContent = readFileSync(cachePath, 'utf-8');
		const cacheEntry: CacheEntry = JSON.parse(cacheContent);

		// 有効期限をチェック
		const now = Date.now();
		if (now - cacheEntry.fetchedAt > CACHE_TTL) {
			console.log(`[OGP] Cache expired: ${url}`);
			return null;
		}

		console.log(`[OGP] Cache hit: ${url}`);
		return cacheEntry.data;
	} catch (error) {
		console.warn(`[OGP] Failed to read cache for ${url}:`, error);
		return null;
	}
}

/**
 * OGPデータをキャッシュに保存
 */
export function saveOgpToCache(url: string, data: OgpData): void {
	const cacheKey = generateCacheKey(url);
	const cachePath = getCachePath(cacheKey);

	const cacheEntry: CacheEntry = {
		data,
		fetchedAt: Date.now(),
		url,
	};

	try {
		// キャッシュディレクトリを作成
		const cacheDir = dirname(cachePath);
		if (!existsSync(cacheDir)) {
			mkdirSync(cacheDir, { recursive: true });
		}

		writeFileSync(cachePath, JSON.stringify(cacheEntry, null, 2));
		console.log(`[OGP] Cached: ${url}`);
	} catch (error) {
		console.warn(`[OGP] Failed to save cache for ${url}:`, error);
	}
}
