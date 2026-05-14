/**
 * OGP データのビルド時キャッシュ。
 *
 * 外部サイトの OGP 情報を `.cache/ogp/{md5}.json` に保存し、TTL 内なら fetch をスキップする。
 * ビルド時間の短縮と外部サイトへの負荷軽減が目的。
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const CACHE_DIR = '.cache/ogp';

// キャッシュ有効期限（7日）
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

export interface OgpData {
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
}

interface CacheEntry {
  data: OgpData;
  fetchedAt: number;
  url: string;
}

function generateCacheKey(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

function getCachePath(cacheKey: string): string {
  return join(CACHE_DIR, `${cacheKey}.json`);
}

export function getOgpFromCache(url: string): OgpData | null {
  const cachePath = getCachePath(generateCacheKey(url));
  if (!existsSync(cachePath)) return null;

  try {
    const entry = JSON.parse(readFileSync(cachePath, 'utf-8')) as CacheEntry;
    if (Date.now() - entry.fetchedAt > CACHE_TTL) {
      console.log(`[OGP] Cache expired: ${url}`);
      return null;
    }
    console.log(`[OGP] Cache hit: ${url}`);
    return entry.data;
  } catch (error) {
    console.warn(`[OGP] Failed to read cache for ${url}:`, error);
    return null;
  }
}

export function saveOgpToCache(url: string, data: OgpData): void {
  const cachePath = getCachePath(generateCacheKey(url));
  const entry: CacheEntry = { data, fetchedAt: Date.now(), url };

  try {
    const cacheDir = dirname(cachePath);
    if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, JSON.stringify(entry, null, 2));
    console.log(`[OGP] Cached: ${url}`);
  } catch (error) {
    console.warn(`[OGP] Failed to save cache for ${url}:`, error);
  }
}
