/**
 * 記事の OG 画像エンドポイント
 * URL: /og/{slug}.png
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgPng } from '@/lib/ogImage';
import { assertUniquePostSlugs, parsePostId } from '@/lib/posts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts');
  assertUniquePostSlugs(posts);

  return posts.map((post) => ({
    params: { slug: parsePostId(post.id).slug },
    props: { title: post.data.title },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title } = props as { title: string };
  const png = await renderOgPng(title);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
