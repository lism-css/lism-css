/**
 * OG 画像 URL ビルダー
 * loos.tools/ogimg-maker の API を利用して 1200x630 JPEG を生成する。
 *
 * @see https://loos.tools/ogimg-maker/guide/
 */
import { siteConfig } from '@/config/site';

const ENDPOINT = 'https://loos.tools/ogimg-maker/api';

export interface OgImageParams {
  /** メインテキスト（最大120文字） */
  title?: string;
  /** 上部小文字（最大40文字） */
  head?: string;
  /** フッター補助テキスト（最大40文字） */
  foot?: string;
  /** レイアウト */
  layout?: 'left' | 'center' | 'top-left';
  /** 背景ID（例: 1-1〜1-7, 2-1〜2-11, 3-1〜3-8） */
  type?: string;
  /** Geometry 背景に重ねるパターンID */
  pattern?: string;
  /** 背景スタイル */
  bg?: 'glass' | 'fill';
  /** 内側フレームを表示 */
  frame?: boolean;
  /** カラーモード */
  mode?: 'light' | 'dark';
  /** 色相 0-360 */
  h?: number;
  /** 彩度 0-40 */
  c?: number;
  /** 明度 0-100 */
  l?: number;
}

export function buildOgImageUrl(params: OgImageParams = {}): string {
  const merged: OgImageParams = { ...siteConfig.ogImage, ...params };
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'frame') {
      if (value) search.set('frame', '1');
      continue;
    }
    search.set(key, String(value));
  }

  return `${ENDPOINT}?${search.toString()}`;
}
