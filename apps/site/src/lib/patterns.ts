import { getPathWithoutLang, getRootLang, isRootLang, type LangCode } from '@/lib/i18n';
import { patterns, categoryIds, isPatternAvailable, type PatternCategory, type PatternCategoryId, type PatternItem } from '@/config/patterns';

const isProd = import.meta.env.PROD;

export function filterPatternItems(items: PatternItem[], lang: LangCode = getRootLang()): PatternItem[] {
  return items
    .filter((item) => isPatternAvailable(item, lang) && (!isProd || !item.draft))
    .map((item) => (lang === 'en' && item.titleEn ? { ...item, title: item.titleEn } : item));
}

export function getPattern(categoryId: string, patternId: string, lang: LangCode = getRootLang()): PatternItem | undefined {
  const category = patterns[categoryId as PatternCategoryId];
  if (!category) return undefined;
  return filterPatternItems(category.items, lang).find((item) => item.id === patternId);
}

export interface PatternCategoryView extends Omit<PatternCategory, 'items'> {
  id: PatternCategoryId;
  items: Array<PatternItem & { categoryId: PatternCategoryId }>;
}

export function getPatternCategories(lang: LangCode = getRootLang()): PatternCategoryView[] {
  return categoryIds
    .map((id) => ({
      ...patterns[id],
      id,
      items: filterPatternItems(patterns[id].items, lang).map((item) => ({ ...item, categoryId: id })),
    }))
    .filter(({ items }) => items.length > 0);
}

export function getPatternCategory(categoryId: string, lang: LangCode = getRootLang()): PatternCategoryView | undefined {
  return getPatternCategories(lang).find((category) => category.id === categoryId);
}

export function getPatternCategoryForItem(categoryId: string, patternId: string, lang: LangCode = getRootLang()): PatternCategoryView | undefined {
  return getPatternCategories(lang).find((category) => category.items.some((item) => item.categoryId === categoryId && item.id === patternId));
}

export function getPatternCategoryIds(lang: LangCode = getRootLang()): PatternCategoryView['id'][] {
  return getPatternCategories(lang).map(({ id }) => id);
}

export function getAllPatternPaths(lang: LangCode = getRootLang()): Array<{ category: string; id: string }> {
  const paths: Array<{ category: string; id: string }> = [];
  for (const [categoryId, category] of Object.entries(patterns)) {
    const items = filterPatternItems(category.items, lang);
    for (const item of items) {
      paths.push({ category: categoryId, id: item.id });
    }
  }
  return paths;
}

export function filterPatternAlternates(alternates: Array<{ lang: LangCode; url: string }>): Array<{ lang: LangCode; url: string }> {
  return alternates.filter(({ lang, url }) => {
    const match = getPathWithoutLang(url).match(/^\/patterns\/([^/]+)(?:\/([^/]+))?\/?$/);
    if (!match) return true;
    const [, category, id] = match;
    return id ? Boolean(getPattern(category, id, lang)) : getPatternCategoryIds(lang).includes(category as PatternCategoryView['id']);
  });
}

// スクリーンショットはroot言語だけ言語ディレクトリなしで置かれている
export function getPatternThumbSrc(lang: LangCode, categoryId: string, patternId: string): string {
  return isRootLang(lang) ? `/screenshots/patterns/${categoryId}/${patternId}.webp` : `/screenshots/patterns/${lang}/${categoryId}/${patternId}.webp`;
}
