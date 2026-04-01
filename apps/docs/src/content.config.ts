import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 記事コレクションの共通スキーマ
 */
const postSchema = z.object({
  title: z.string(),
  navtitle: z.string().optional(), // サイドバーナビで表示するタイトル（省略時はtitleを使用）
  description: z.string(),
  date: z.date().optional(), // 公開日（ドキュメントでは任意）
  tags: z.array(z.string()).default([]).optional(), // タグ（ドキュメントでは不要）
  draft: z.boolean().default(false),
  hero: z.string().optional(),
  order: z.number().optional(), // サイドバーでの表示順序（小さい順、未指定は999扱い）
});

// `_` 付きディレクトリ内の MDX（部分テンプレート等）はコレクション対象外にする（従来の content と同様）
const mdMdxWithUnderscoreExcludes = ['**/*.{md,mdx}', '!**/_*/**'] as const;

/**
 * 言語別コレクション定義
 * - ja: 日本語（root言語）
 * - en: 英語
 * memo: Astro 5 の Content Layer では各コレクションに loader が必須（legacy.collections 併用だと同期がスキップされる）
 */
const ja = defineCollection({
  loader: glob({
    base: './src/content/ja',
    pattern: [...mdMdxWithUnderscoreExcludes],
  }),
  schema: postSchema,
});

const en = defineCollection({
  loader: glob({
    base: './src/content/en',
    pattern: [...mdMdxWithUnderscoreExcludes],
  }),
  schema: postSchema,
});

export const collections = {
  ja,
  en,
};

// スキーマ型をエクスポート（必要に応じて使用）
export type PostSchema = z.infer<typeof postSchema>;
