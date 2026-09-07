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
      'process',
      'pricetable',
      'stats',
      'logos',
      'testimonials',
      'posts',
      'greeting',
      'member',
      'history',
      'information',
      'faq',
      'cta',
      'content-links',
      'section',
      'footer',
    ]);
    expect(Object.keys(patterns)).toEqual(categoryIds);
    expect(Object.values(patterns).flatMap(({ items }) => items)).toHaveLength(59);
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
      expect(catalog.getPatternCategory('feature', lang)?.items.map(({ id }) => id)).toEqual(['feature01', 'feature02']);
      expect(catalog.getPatternCategory('footer', lang)?.items.map(({ id }) => id)).toEqual(['footer01', 'footer02']);
      expect(catalog.getPattern('feature', 'feature03', lang)).toBeUndefined();
      expect(catalog.getPattern('footer', 'footer03', lang)).toBeUndefined();
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
      expect(catalog.getPatternCategory('posts', lang)?.items.map(({ id }) => id)).toEqual([
        'posts01',
        'posts02',
        'posts03',
        'posts04',
        'posts05',
        'posts06',
      ]);
      expect(catalog.getPatternCategory('posts', lang)?.label).toBe('Posts');
      for (const category of ['news', 'works', 'navigation']) {
        expect(catalog.getPatternCategory(category, lang)).toBeUndefined();
      }
      expect(catalog.getPattern('posts', 'news001', lang)).toBeUndefined();
      expect(catalog.getPattern('news', 'news001', lang)).toBeUndefined();
      expect(catalog.getPattern('hero', 'hero001', lang)).toBeUndefined();
    }
  });

  it('リンク集・フッター・CTAを日英共通のカテゴリとURLで取得できる', () => {
    expect(catalog.getPatternCategory('content-links', 'ja')?.items.map(({ id }) => id)).toEqual([
      'content-links01',
      'content-links02',
      'content-links03',
      'content-links04',
      'content-links05',
      'content-links06',
      'content-links07',
      'content-links08',
      'content-links09',
    ]);
    expect(catalog.getPatternCategory('content-links', 'en')?.items).toHaveLength(9);
    for (const lang of ['ja', 'en'] as const) {
      expect(catalog.getPattern('content-links', 'content-links09', lang)?.title).toBe('ContentLinks09');
      expect(catalog.getPattern('footer', 'footer01', lang)?.title).toBe('Footer01');
      expect(catalog.getPattern('cta', 'cta05', lang)?.title).toBe('CTA05');
      expect(catalog.getPattern('section', 'section005', lang)).toBeUndefined();
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

  it('下書き3件は本番で除外し、開発時には同じ番号で日英とも表示する', async () => {
    for (const lang of ['ja', 'en'] as const) {
      for (const category of ['process', 'stats', 'logos']) {
        expect(catalog.getPattern(category, `${category}01`, lang)).toBeUndefined();
        expect(catalog.getPatternCategoryIds(lang)).not.toContain(category);
      }
    }
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const devCatalog = await import('./patterns');
    expect(devCatalog.getAllPatternPaths('en')).toEqual(devCatalog.getAllPatternPaths('ja'));
    for (const lang of ['ja', 'en'] as const) {
      expect(devCatalog.getAllPatternPaths(lang)).toHaveLength(catalog.getAllPatternPaths(lang).length + 3);
      for (const category of ['process', 'stats', 'logos']) {
        const pattern = devCatalog.getPattern(category, `${category}01`, lang);
        expect(pattern?.draft).toBe(true);
        expect(pattern?.description[lang]).toBeTruthy();
        const file = lang === 'ja' ? 'index.astro' : 'en.astro';
        expect(existsSync(resolve('src/pages/preview/patterns', category, `${category}01`, file))).toBe(true);
        expect(devCatalog.getPatternCategoryIds(lang)).toContain(category);
      }
      expect(devCatalog.getPattern('hero', 'hero01', lang)).toEqual(catalog.getPattern('hero', 'hero01', lang));
    }
  });

  it('言語切替とhreflangに存在する同一IDのページ・カテゴリだけを含める', () => {
    const alternates = (path: string) => catalog.filterPatternAlternates(getAlternateUrls(path)).map(({ lang }) => lang);
    expect(alternates('/patterns/feature/feature01/')).toEqual(['ja', 'en']);
    expect(alternates('/en/patterns/content-links/content-links15/')).toEqual([]);
    expect(alternates('/patterns/logos/')).toEqual([]);
    for (const category of ['posts', 'content-links', 'footer']) {
      expect(alternates(`/patterns/${category}/`)).toEqual(['ja', 'en']);
      expect(alternates(`/patterns/${category}/${category}01/`)).toEqual(['ja', 'en']);
    }
    for (const category of ['news', 'works', 'navigation']) {
      expect(alternates(`/en/patterns/${category}/`)).toEqual([]);
    }
    expect(alternates('/patterns/news/news001/')).toEqual([]);
    expect(alternates('/patterns/testimonials/testimonials02/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/cta/cta05/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/')).toEqual(['ja', 'en']);
    expect(alternates('/docs/overview/')).toEqual(['ja', 'en']);
  });
});
