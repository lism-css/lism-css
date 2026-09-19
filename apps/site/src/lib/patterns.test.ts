import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PatternCategory } from '@/config/patterns';
import { getAlternateUrls } from './i18n';

let catalog: typeof import('./patterns');

beforeEach(async () => {
  vi.stubEnv('PROD', true);
  vi.resetModules();
  catalog = await import('./patterns');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('言語ごとのパターン公開', () => {
  it('カテゴリ順を patterns の定義順と揃え、下書きも含めてカテゴリ名と2桁の連番で採番する', async () => {
    const { patterns, categoryIds } = await import('@/config/patterns');
    expect(Object.keys(patterns)).toEqual(categoryIds);
    for (const category of categoryIds) {
      const { items } = patterns[category];
      expect(items.map(({ id }) => id)).toEqual(items.map((_, index) => `${category}${String(index + 1).padStart(2, '0')}`));
      for (const item of items) {
        const number = item.id.slice(-2);
        expect(item.title).toMatch(new RegExp(`^(?:[A-Za-z]+${number}|${number} - .+)$`));
      }
    }
  });

  it('日本語を正に日英の公開カテゴリ・ID・並び順を揃える', () => {
    expect(catalog.getPatternCategoryIds('en')).toEqual(catalog.getPatternCategoryIds('ja'));
    expect(catalog.getAllPatternPaths('en')).toEqual(catalog.getAllPatternPaths('ja'));
  });

  it('生成対象の全ページにプレビューソースと説明があり、カテゴリと個別取得が一致する', () => {
    for (const lang of ['ja', 'en'] as const) {
      for (const { category, id } of catalog.getAllPatternPaths(lang)) {
        const file = lang === 'ja' ? 'index.astro' : `${lang}.astro`;
        const path = resolve('src/pages/preview/patterns', category, id, file);
        expect(existsSync(path), `${lang}: ${category}/${id}`).toBe(true);
        const pattern = catalog.getPattern(category, id, lang);
        expect(pattern?.description[lang]).toBeTruthy();
        const categoryView = catalog.getPatternCategoryForItem(category, id, lang);
        expect(categoryView?.id).toBe(category);
        expect(categoryView?.items.find((item) => item.id === id)).toEqual({ ...pattern, categoryId: category });
      }
    }
  });

  it('NewsとWorksを日英共通のPostsへ統合し、旧カテゴリと旧IDを公開しない', () => {
    for (const lang of ['ja', 'en'] as const) {
      expect(catalog.getPatternCategory('posts', lang)?.label).toBe('Posts');
      for (const category of ['news', 'works', 'navigation']) {
        expect(catalog.getPatternCategory(category, lang)).toBeUndefined();
      }
      expect(catalog.getPattern('posts', 'news001', lang)).toBeUndefined();
      expect(catalog.getPattern('news', 'news001', lang)).toBeUndefined();
      expect(catalog.getPattern('hero', 'hero001', lang)).toBeUndefined();
    }
  });

  it('languages 未指定の例は日英とも公開し、指定がある例は指定言語だけで公開する', () => {
    const base = { id: 'x01', title: 'X01', description: { ja: 'ja', en: 'en' } };
    const items = [base, { ...base, id: 'x02', languages: ['ja' as const] }, { ...base, id: 'x03', languages: ['en' as const] }];
    expect(catalog.filterPatternItems(items, 'ja').map(({ id }) => id)).toEqual(['x01', 'x02']);
    expect(catalog.filterPatternItems(items, 'en').map(({ id }) => id)).toEqual(['x01', 'x03']);
  });

  it('番号付きの説明タイトルを翻訳し、別言語の取得で元のタイトルを変えない', () => {
    const description = { ja: 'ja', en: 'en' };
    const items = [
      { id: 'x01', title: 'X01', description },
      { id: 'x02', title: '02 - 説明', titleEn: '02 - Description', description },
    ];
    expect(catalog.filterPatternItems(items, 'ja').map(({ title }) => title)).toEqual(['X01', '02 - 説明']);
    expect(catalog.filterPatternItems(items, 'en').map(({ title }) => title)).toEqual(['X01', '02 - Description']);
    expect(catalog.filterPatternItems(items, 'ja').map(({ title }) => title)).toEqual(['X01', '02 - 説明']);
  });

  // @/config/sidebar の import が重く、CI では既定の 5 秒を超えることがある
  it('サイドバーのURL・タイトル・カテゴリ順と生成対象ページが一致する', async () => {
    const { getPatternsSidebar } = await import('@/config/sidebar');
    for (const lang of ['ja', 'en'] as const) {
      const [overview, ...sidebar] = getPatternsSidebar(lang);
      expect(overview).toEqual({
        label: 'Patterns',
        items: [{ label: 'すべてのパターン', translate: { en: 'All patterns' }, link: '/patterns/' }],
      });
      const links = sidebar.flatMap((section) =>
        'items' in section ? section.items.flatMap((item) => (typeof item === 'object' && 'link' in item ? [item] : [])) : []
      );
      const routes = catalog.getAllPatternPaths(lang).map(({ category, id }) => ({
        link: `/patterns/${category}/${id}`,
        label: catalog.getPattern(category, id, lang)?.title,
      }));
      expect(links).toEqual(routes);
      expect(sidebar.map(({ label, link }) => ({ label, link }))).toEqual(
        catalog.getPatternCategories(lang).map(({ id, label }) => ({ label, link: `/patterns/${id}/` }))
      );
    }
  }, 20_000);

  it('下書きは本番で除外し、開発時には同じ番号で日英とも表示する', async () => {
    const { patterns } = await import('@/config/patterns');
    const categories = Object.entries(patterns) as [string, PatternCategory][];
    const drafts = categories.flatMap(([category, { items }]) => items.filter((item) => item.draft).map((item) => [category, item.id] as const));
    const draftOnlyCategories = categories.filter(([, { items }]) => items.every((item) => item.draft)).map(([category]) => category);
    expect(drafts.length).toBeGreaterThan(0);
    for (const lang of ['ja', 'en'] as const) {
      for (const [category, id] of drafts) {
        expect(catalog.getPattern(category, id, lang), `${lang}: ${category}/${id}`).toBeUndefined();
      }
      for (const category of draftOnlyCategories) {
        expect(catalog.getPatternCategoryIds(lang)).not.toContain(category);
      }
    }
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const devCatalog = await import('./patterns');
    expect(devCatalog.getAllPatternPaths('en')).toEqual(devCatalog.getAllPatternPaths('ja'));
    for (const lang of ['ja', 'en'] as const) {
      expect(devCatalog.getAllPatternPaths(lang)).toHaveLength(catalog.getAllPatternPaths(lang).length + drafts.length);
      const file = lang === 'ja' ? 'index.astro' : 'en.astro';
      for (const [category, id] of drafts) {
        const pattern = devCatalog.getPattern(category, id, lang);
        expect(pattern?.draft, `${lang}: ${category}/${id}`).toBe(true);
        expect(pattern?.description[lang]).toBeTruthy();
        expect(existsSync(resolve('src/pages/preview/patterns', category, id, file))).toBe(true);
      }
      for (const category of draftOnlyCategories) {
        expect(devCatalog.getPatternCategoryIds(lang)).toContain(category);
      }
      const [{ category, id }] = catalog.getAllPatternPaths(lang);
      expect(devCatalog.getPattern(category, id, lang)).toEqual(catalog.getPattern(category, id, lang));
    }
  });

  it('言語切替とhreflangに存在する同一IDのページ・カテゴリだけを含める', async () => {
    const { patterns } = await import('@/config/patterns');
    const alternates = (path: string) => catalog.filterPatternAlternates(getAlternateUrls(path)).map(({ lang }) => lang);
    // 公開中の代表: 先頭のページとそのカテゴリ
    const [published] = catalog.getAllPatternPaths('ja');
    expect(alternates(`/patterns/${published.category}/${published.id}/`)).toEqual(['ja', 'en']);
    expect(alternates(`/patterns/${published.category}/`)).toEqual(['ja', 'en']);
    // 非公開の代表: 下書きのページと、下書きだけのカテゴリ
    const categories = Object.entries(patterns) as [string, PatternCategory][];
    for (const [category, { items }] of categories) {
      const draft = items.find((item) => item.draft);
      if (draft) expect(alternates(`/en/patterns/${category}/${draft.id}/`), `${category}/${draft.id}`).toEqual([]);
      if (items.every((item) => item.draft)) expect(alternates(`/patterns/${category}/`), category).toEqual([]);
    }
    for (const category of ['news', 'works', 'navigation']) {
      expect(alternates(`/en/patterns/${category}/`)).toEqual([]);
    }
    expect(alternates('/patterns/news/news001/')).toEqual([]);
    expect(alternates('/patterns/')).toEqual(['ja', 'en']);
    expect(alternates('/docs/overview/')).toEqual(['ja', 'en']);
  });
});
