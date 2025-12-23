import { defineCollection, z } from 'astro:content';

/**
 * 記事コレクションの共通スキーマ
 */
const postSchema = z.object({
	title: z.string(),
	navtitle: z.string().optional(), // サイドバーナビで表示するタイトル（省略時はtitleを使用）
	description: z.string(),
	date: z.date(),
	tags: z.array(z.string()).default([]),
	draft: z.boolean().default(false),
	hero: z.string().optional(),
	order: z.number().optional(), // サイドバーでの表示順序（小さい順、未指定は999扱い）
});

/**
 * 言語別コレクション定義
 * - ja: 日本語（root言語）
 * - en: 英語
 */
const ja = defineCollection({
	type: 'content',
	schema: postSchema,
});

const en = defineCollection({
	type: 'content',
	schema: postSchema,
});

export const collections = {
	ja,
	en,
};

// スキーマ型をエクスポート（必要に応じて使用）
export type PostSchema = z.infer<typeof postSchema>;
