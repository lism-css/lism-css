import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    for (const lang of ['ja', 'en'] as const) {
      expect(catalog.getPatternCategory('testimonials', lang)?.items.map(({ id }) => id)).toEqual(['testimonials01', 'testimonials02']);
      expect(catalog.getPatternCategory('footer', lang)).toBeUndefined();
      expect(catalog.getPattern('testimonials', 'testimonials03', lang)).toBeUndefined();
      expect(catalog.getPattern('footer', 'footer02', lang)).toBeUndefined();
    }
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
      expect(catalog.getPatternCategory('posts', lang)?.items.map(({ id }) => id)).toEqual(['posts01', 'posts02', 'posts03', 'posts04']);
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
    expect(catalog.getPattern('testimonials', 'testimonials02', 'ja')?.title).toBe('02 - 導入成果と担当者の声');
    expect(catalog.getPattern('testimonials', 'testimonials02', 'en')?.title).toBe('02 - Customer results and feedback');
    expect(catalog.getPattern('testimonials', 'testimonials02', 'ja')?.title).toBe('02 - 導入成果と担当者の声');
    for (const lang of ['ja', 'en'] as const) {
      expect(catalog.getPattern('posts', 'posts01', lang)?.title).toBe('Posts01');
    }
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
    const drafts = Object.entries(patterns).flatMap(([category, { items }]) =>
      items.filter((item) => item.draft).map((item) => [category, item.id] as const)
    );
    const draftOnlyCategories = Object.entries(patterns)
      .filter(([, { items }]) => items.every((item) => item.draft))
      .map(([category]) => category);
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

  it('言語切替とhreflangに存在する同一IDのページ・カテゴリだけを含める', () => {
    const alternates = (path: string) => catalog.filterPatternAlternates(getAlternateUrls(path)).map(({ lang }) => lang);
    expect(alternates('/patterns/hero/hero01/')).toEqual(['ja', 'en']);
    expect(alternates('/en/patterns/page-links/page-links15/')).toEqual([]);
    expect(alternates('/patterns/logos/')).toEqual([]);
    expect(alternates('/patterns/footer/')).toEqual([]);
    for (const category of ['posts', 'page-links']) {
      expect(alternates(`/patterns/${category}/`)).toEqual(['ja', 'en']);
      expect(alternates(`/patterns/${category}/${category}01/`)).toEqual(['ja', 'en']);
    }
    for (const category of ['news', 'works', 'navigation']) {
      expect(alternates(`/en/patterns/${category}/`)).toEqual([]);
    }
    expect(alternates('/patterns/news/news001/')).toEqual([]);
    expect(alternates('/patterns/testimonials/testimonials02/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/cta/cta01/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/')).toEqual(['ja', 'en']);
    expect(alternates('/docs/overview/')).toEqual(['ja', 'en']);
  });
});
