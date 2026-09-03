import { isRootLang, type LangCode } from '@/lib/i18n';
import { patterns, type PatternCategoryId, type PatternItem } from '@/config/patterns';

const isProd = import.meta.env.PROD;

export function filterDraftItems(items: PatternItem[]): PatternItem[] {
  if (!isProd) return items;
  return items.filter((item) => !item.draft);
}

export function getPattern(categoryId: string, patternId: string): PatternItem | undefined {
  const category = patterns[categoryId as PatternCategoryId];
  if (!category) return undefined;
  const item: PatternItem | undefined = category.items.find((item) => item.id === patternId);
  if (isProd && item?.draft) return undefined;
  return item;
}

export function getAllPatternPaths(): Array<{ category: string; id: string }> {
  const paths: Array<{ category: string; id: string }> = [];
  for (const [categoryId, category] of Object.entries(patterns)) {
    const items = filterDraftItems(category.items);
    for (const item of items) {
      paths.push({ category: categoryId, id: item.id });
    }
  }
  return paths;
}

// スクリーンショットはroot言語だけ言語ディレクトリなしで置かれている
export function getPatternThumbSrc(lang: LangCode, categoryId: string, patternId: string): string {
  return isRootLang(lang) ? `/screenshots/patterns/${categoryId}/${patternId}.png` : `/screenshots/patterns/${lang}/${categoryId}/${patternId}.png`;
}
