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
  it('カテゴリ順を揃え、下書きも含めてカテゴリ名と2桁の連番で採番する', async () => {
    const { patterns, categoryIds } = await import('@/config/patterns');
    expect(categoryIds).toEqual([
      'hero',
      'feature',
      'pricing',
      'about',
      'member',
      'testimonials',
      'posts',
      'faq',
      'cta',
      'page-links',
      'general',
      'process',
      'stats',
      'logos',
      'footer',
    ]);
    expect(Object.keys(patterns)).toEqual(categoryIds);
    expect(Object.values(patterns).flatMap(({ items }) => items)).toHaveLength(62);
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

  it('リンク集・CTAを日英共通のカテゴリとURLで取得できる', () => {
    expect(catalog.getPatternCategory('page-links', 'ja')?.items.map(({ id }) => id)).toEqual([
      'page-links01',
      'page-links02',
      'page-links03',
      'page-links04',
      'page-links05',
      'page-links06',
      'page-links07',
    ]);
    expect(catalog.getPatternCategory('page-links', 'en')?.items).toHaveLength(7);
    for (const lang of ['ja', 'en'] as const) {
      expect(catalog.getPattern('page-links', 'page-links07', lang)?.title).toBe('PageLinks07');
      expect(catalog.getPatternCategory('feature', lang)?.items.map(({ id }) => id)).toEqual(['feature01', 'feature02', 'feature03', 'feature04']);
      expect(catalog.getPattern('feature', 'feature03', lang)?.title).toBe('Feature03');
      expect(catalog.getPattern('feature', 'feature04', lang)?.title).toBe('Feature04');
      expect(catalog.getPatternCategory('cta', lang)?.items.map(({ id }) => id)).toEqual(['cta01', 'cta02']);
      expect(catalog.getPattern('cta', 'cta01', lang)?.title).toBe('CTA01');
      expect(catalog.getPattern('cta', 'cta05', lang)).toBeUndefined();
      expect(catalog.getPattern('section', 'section01', lang)).toBeUndefined();
    }
  });

  it('番号付きの説明タイトルを翻訳し、別言語の取得で元のタイトルを変えない', () => {
    expect(catalog.getPattern('testimonials', 'testimonials02', 'ja')?.title).toBe('02 - 導入成果と担当者の声');
    expect(catalog.getPattern('testimonials', 'testimonials02', 'en')?.title).toBe('02 - Customer results and feedback');
    expect(catalog.getPattern('testimonials', 'testimonials02', 'ja')?.title).toBe('02 - 導入成果と担当者の声');
    for (const lang of ['ja', 'en'] as const) {
      expect(catalog.getPattern('posts', 'posts01', lang)?.title).toBe('Posts01');
    }
  });

  it('サイドバーのURL・タイトル・カテゴリ順と生成対象ページが一致する', async () => {
    const { getPatternsSidebar } = await import('@/config/sidebar');
    for (const lang of ['ja', 'en'] as const) {
      const sidebar = getPatternsSidebar(lang);
      const links = sidebar.flatMap((section) =>
        'items' in section ? section.items.flatMap((item) => (typeof item === 'object' && 'link' in item ? [item] : [])) : []
      );
      const routes = catalog.getAllPatternPaths(lang).map(({ category, id }) => ({
        link: `/patterns/${category}/${id}`,
        label: catalog.getPattern(category, id, lang)?.title,
      }));
      expect(links).toEqual(routes);
      expect(sidebar.map(({ label }) => label)).toEqual(catalog.getPatternCategories(lang).map(({ label }) => label));
    }
  });

  it('下書き11件は本番で除外し、開発時には同じ番号で日英とも表示する', async () => {
    const drafts = [
      ['hero', 'hero04'],
      ['hero', 'hero05'],
      ['feature', 'feature05'],
      ['pricing', 'pricing03'],
      ['cta', 'cta03'],
      ['cta', 'cta04'],
      ['process', 'process01'],
      ['process', 'process02'],
      ['stats', 'stats01'],
      ['logos', 'logos01'],
      ['footer', 'footer01'],
    ] as const;
    const draftOnlyCategories = ['process', 'stats', 'logos', 'footer'];
    for (const lang of ['ja', 'en'] as const) {
      for (const [category, id] of drafts) {
        expect(catalog.getPattern(category, id, lang), `${lang}: ${category}/${id}`).toBeUndefined();
      }
      for (const category of draftOnlyCategories) {
        expect(catalog.getPatternCategoryIds(lang)).not.toContain(category);
      }
      expect(catalog.getPatternCategory('pricing', lang)?.items.map(({ id }) => id)).toEqual(['pricing01', 'pricing02']);
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
      expect(devCatalog.getPattern('hero', 'hero01', lang)).toEqual(catalog.getPattern('hero', 'hero01', lang));
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
