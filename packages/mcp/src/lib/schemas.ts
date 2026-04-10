import { z } from 'zod';

export const DocsEntrySchema = z.object({
  sourcePath: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  headings: z.array(z.string()),
  keywords: z.array(z.string()),
  snippet: z.string(),
});
