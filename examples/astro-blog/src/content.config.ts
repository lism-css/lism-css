import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    base: './src/posts',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    category: z.string(),
    readtime: z.string(),
  }),
});

export const collections = { posts };
