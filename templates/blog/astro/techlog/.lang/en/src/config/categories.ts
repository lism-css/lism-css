/**
 * English template overlay for `lism create --lang en`.
 * Mirrors the base `src/config/categories.ts`; only the display `description`
 * values are translated. Keys / labels / ogImage overrides stay in sync.
 */
import type { OgImageParams } from '@/lib/ogImage';

export type CategoryKey = 'tech' | 'column';

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
  /** Overrides for OG image params (applied on top of siteConfig.ogImage defaults) */
  ogImage?: Partial<OgImageParams>;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  tech: {
    key: 'tech',
    label: 'TECH',
    description: 'Technical articles and development notes',
  },
  column: {
    key: 'column',
    label: 'COLUMN',
    description: 'Columns and miscellaneous notes beyond tech',
    ogImage: { h: 180 },
  },
};

export const CATEGORY_KEYS: CategoryKey[] = ['tech', 'column'];
