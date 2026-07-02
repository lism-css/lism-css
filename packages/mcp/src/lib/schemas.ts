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
