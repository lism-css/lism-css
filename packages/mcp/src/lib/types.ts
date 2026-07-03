import type { z } from 'zod';
import type { MetaInfoSchema, DocsEntrySchema, SearchResultSchema } from './schemas.js';

export type MetaInfo = z.infer<typeof MetaInfoSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type DocsEntry = z.infer<typeof DocsEntrySchema>;
