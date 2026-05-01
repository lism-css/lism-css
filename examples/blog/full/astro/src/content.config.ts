import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    base: './src/posts',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
