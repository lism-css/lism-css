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
  it('日本語で統合した例と翻訳前の新規例を、それぞれの公開言語でだけ取得できる', () => {
    expect(catalog.getPattern('navigation', 'navigation001', 'ja')).toBeUndefined();
    expect(catalog.getPattern('navigation', 'navigation001', 'en')).toBeDefined();
    expect(catalog.getPattern('navigation', 'navigation002', 'ja')).toBeDefined();
    expect(catalog.getPattern('member', 'member002', 'ja')).toBeDefined();
    expect(catalog.getPattern('member', 'member003', 'ja')).toBeDefined();
    expect(catalog.getPattern('feature', 'feature002', 'ja')).toBeDefined();
    expect(catalog.getPattern('feature', 'feature004', 'ja')).toBeDefined();
    expect(catalog.getPattern('feature', 'feature015', 'ja')).toBeUndefined();
    expect(catalog.getPattern('feature', 'feature016', 'ja')).toBeUndefined();
    expect(catalog.getPattern('navigation', 'navigation008', 'ja')).toBeUndefined();
    for (const id of ['section009-2', 'section011', 'section012']) {
      expect(catalog.getPattern('section', id, 'ja')).toBeDefined();
    }
    for (const id of ['section009', 'section014']) {
      expect(catalog.getPattern('section', id, 'ja')).toBeUndefined();
      expect(catalog.getPattern('section', id, 'en')).toBeDefined();
    }
    expect(catalog.getPattern('hero', 'hero003', 'ja')).toBeDefined();
    expect(catalog.getPattern('hero', 'hero003', 'en')).toBeUndefined();
    expect(catalog.getPatternCategoryIds('ja')).toContain('stats');
    expect(catalog.getPatternCategoryIds('en')).not.toContain('stats');
  });

  it('生成対象の全ページに対応するプレビューソースがある', () => {
    for (const lang of ['ja', 'en'] as const) {
      for (const { category, id } of catalog.getAllPatternPaths(lang)) {
        const file = lang === 'ja' ? 'index.astro' : `${lang}.astro`;
        const path = resolve('src/pages/preview/patterns', category, id, file);
        expect(existsSync(path), `${lang}: ${category}/${id}`).toBe(true);
        expect(catalog.getPattern(category, id, lang)?.description[lang]).toBeTruthy();
      }
    }
  });

  it('日本語のNewsとWorksをPostsにまとめ、個別ページと英語の分類は維持する', async () => {
    const posts = catalog.getPatternCategory('posts', 'ja');
    expect(posts?.label).toBe('Posts');
    expect(posts?.items.map(({ categoryId, id }) => `${categoryId}/${id}`)).toEqual([
      'news/news001',
      'news/news003',
      'news/news005',
      'news/news006',
      'works/works001',
      'works/works002',
    ]);
    expect(catalog.getPatternCategoryIds('ja')).toContain('posts');
    expect(catalog.getPatternCategoryIds('ja')).not.toContain('news');
    expect(catalog.getPatternCategoryIds('ja')).not.toContain('works');
    expect(catalog.getPatternCategory('news', 'ja')?.id).toBe('posts');
    expect(catalog.getPatternCategory('works', 'ja')?.id).toBe('posts');
    expect(catalog.getPatternCategory('news', 'en')?.label).toBe('News');
    expect(catalog.getPatternCategory('works', 'en')?.label).toBe('Works');
    expect(catalog.getPatternCategory('posts', 'en')).toBeUndefined();

    const { getPatternsSidebar } = await import('@/config/sidebar');
    const sidebar = getPatternsSidebar('ja');
    expect(sidebar.filter(({ label }) => label === 'Posts')).toHaveLength(1);
    expect(sidebar.some(({ label }) => label === 'News' || label === 'Works')).toBe(false);
  });

  it('サイドバーのリンクと生成対象ページが一致する', async () => {
    const { getPatternsSidebar } = await import('@/config/sidebar');
    for (const lang of ['ja', 'en'] as const) {
      const links = getPatternsSidebar(lang).flatMap((section) =>
        'items' in section ? section.items.flatMap((item) => (typeof item === 'object' && 'link' in item ? [item.link] : [])) : []
      );
      const routes = catalog.getAllPatternPaths(lang).map(({ category, id }) => `/patterns/${category}/${id}`);
      expect(links).toHaveLength(routes.length);
      expect(new Set(links)).toEqual(new Set(routes));
    }
  });

  it('Section005を日本語のCTAへ移し、詳細ページの分類と既存URLを維持する', () => {
    expect(catalog.getPatternCategory('cta', 'ja')?.items.some(({ id }) => id === 'section005')).toBe(true);
    expect(catalog.getPatternCategory('section', 'ja')?.items.some(({ id }) => id === 'section005')).toBe(false);
    expect(catalog.getPatternCategoryForItem('section', 'section005', 'ja')?.id).toBe('cta');
    expect(catalog.getPatternCategoryForItem('section', 'section005', 'en')?.id).toBe('section');
    expect(catalog.getPattern('section', 'section005', 'ja')).toBeDefined();
    expect(catalog.getAllPatternPaths('ja')).toContainEqual({ category: 'section', id: 'section005' });
  });

  it('機能紹介・コンテンツへのリンク・フッターを分け、英語の分類は維持する', () => {
    expect(catalog.getPatternCategory('feature', 'ja')?.items.map(({ id }) => id)).toEqual(['feature017', 'feature018', 'feature019']);
    expect(catalog.getPatternCategory('content-links', 'ja')?.items.map(({ id }) => id)).toEqual([
      'feature001',
      'feature002',
      'feature004',
      'feature005',
      'feature006',
      'feature007',
      'feature011',
      'feature013',
      'navigation007',
    ]);
    expect(catalog.getPatternCategory('footer', 'ja')?.items.map(({ id }) => id)).toEqual(['navigation002', 'navigation005']);
    expect(catalog.getPatternCategoryForItem('feature', 'feature002', 'ja')?.id).toBe('content-links');
    expect(catalog.getPatternCategoryForItem('navigation', 'navigation007', 'ja')?.id).toBe('content-links');
    expect(catalog.getPatternCategoryForItem('navigation', 'navigation002', 'ja')?.id).toBe('footer');
    expect(catalog.getPatternCategory('navigation', 'ja')?.id).toBe('content-links');
    expect(catalog.getPatternCategory('feature', 'en')?.items).toHaveLength(16);
    expect(catalog.getPatternCategory('navigation', 'en')?.items).toHaveLength(8);
    expect(catalog.getPatternCategory('content-links', 'en')).toBeUndefined();
    expect(catalog.getPatternCategory('footer', 'en')).toBeUndefined();
  });

  it('開発時だけ下書きを表示し、開発時にも言語の制限は維持する', async () => {
    expect(catalog.getPattern('section', 'section901', 'en')).toBeUndefined();
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const devCatalog = await import('./patterns');
    expect(devCatalog.getPattern('section', 'section901', 'en')).toBeDefined();
    expect(devCatalog.getPattern('section', 'section901', 'ja')).toBeUndefined();
  });

  it('言語切替とhreflangに存在しない個別ページ・カテゴリを含めない', () => {
    const alternates = (path: string) => catalog.filterPatternAlternates(getAlternateUrls(path)).map(({ lang }) => lang);
    expect(alternates('/patterns/hero/hero003/')).toEqual(['ja']);
    expect(alternates('/en/patterns/navigation/navigation001/')).toEqual(['en']);
    expect(alternates('/patterns/stats/')).toEqual(['ja']);
    expect(alternates('/patterns/posts/')).toEqual(['ja']);
    expect(alternates('/patterns/content-links/')).toEqual(['ja']);
    expect(alternates('/patterns/footer/')).toEqual(['ja']);
    expect(alternates('/en/patterns/navigation/')).toEqual(['en']);
    expect(alternates('/en/patterns/news/')).toEqual(['en']);
    expect(alternates('/en/patterns/works/')).toEqual(['en']);
    expect(alternates('/patterns/news/news001/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/works/works001/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/cta/cta001/')).toEqual(['ja', 'en']);
    expect(alternates('/patterns/')).toEqual(['ja', 'en']);
    expect(alternates('/docs/overview/')).toEqual(['ja', 'en']);
  });
});
