import type { APIRoute } from 'astro';
import { getUiOgPathsForRoot, generateOgImage } from '@/lib/pageHelpers';
import type { LangCode } from '@/lib/i18n';

export const getStaticPaths = getUiOgPathsForRoot;

export const GET: APIRoute = async ({ props }) => {
  const { lang, slug } = props as { lang: LangCode; slug: string };
  return generateOgImage(lang, slug);
};
