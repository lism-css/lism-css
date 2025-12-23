/**
 * OG画像生成エンドポイント（root言語用）
 */
import type { APIRoute } from 'astro';
import { getOgPathsForRoot, generateOgImage } from '@/lib/pageHelpers';
import type { LangCode } from '@/lib/i18n';

// 共通ヘルパーを使用
export const getStaticPaths = getOgPathsForRoot;

export const GET: APIRoute = async ({ props }) => {
	const { lang, slug } = props as { lang: LangCode; slug: string };
	return generateOgImage(lang, slug);
};

