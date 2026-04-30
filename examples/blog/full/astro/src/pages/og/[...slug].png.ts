/**
 * 記事の OG 画像エンドポイント
 * URL: /og/{category}/{slug}.png
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgPng } from '@/lib/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id }, // 例: "dev/lism-css-intro"
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
