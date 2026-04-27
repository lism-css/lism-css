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
    tags: z.array(z.string()).default([]),
    readtime: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({
    base: './src/static-pages',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
