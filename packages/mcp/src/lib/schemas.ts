import { z } from 'zod';

export const MetaInfoSchema = z.object({
  generatedAt: z.string(),
  sourceCommit: z.string(),
  docsVersion: z.string(),
});

export const DocsEntrySchema = z.object({
  sourcePath: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  headings: z.array(z.string()),
  keywords: z.array(z.string()),
  snippet: z.string(),
});

export const SearchResultSchema = z.object({
  sourcePath: z.string(),
  url: z.string(),
  heading: z.string(),
  snippet: z.string(),
  score: z.number(),
  nextTool: z.string().nullable(),
});
