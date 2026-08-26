import { afterEach, describe, expect, test, vi } from 'vitest';
import type { ViewerPage } from 'virtual:lism-mockup/pages';

import { groupPages } from './groupPages';
import { isModifiedClick } from './isModifiedClick';
import { PINNED_PAGE_ID, splitPinnedPage } from './pinnedPage';
import { buildEmbedSrc, buildGalleryHref, buildPageHref, buildTokensHref, readRouteFromUrl } from './useViewerRoute';

function page(id: string, extras: Partial<ViewerPage> = {}): ViewerPage {
  return { id, label: extras.label ?? id, load: () => Promise.resolve({ default: () => null }), ...extras };
}

function stubLocation(search = '', pathname = '/preview', hash = ''): void {
  const href = `https://example.test${pathname}${search}${hash}`;
  vi.stubGlobal('window', { location: { href, pathname, search, hash } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('groupPages', () => {
  test('空配列は空のグループ一覧を返す', () => {
    expect(groupPages([])).toEqual([]);
  });

  test('category が無いページは Pages グループにまとめる', () => {
    const pages = [page('home'), page('about')];
    expect(groupPages(pages)).toEqual([{ key: '__lism-mockup:default__', label: 'Pages', pages }]);
  });

  test('category ごとに挿入順のグループを作る', () => {
    const landing = page('landing', { category: 'Marketing' });
    const home = page('home');
    const dash = page('admin/dashboard', { category: 'Admin' });
    const settings = page('admin/settings', { category: 'Admin' });

    expect(groupPages([landing, home, dash, settings])).toEqual([
      { key: 'Marketing', label: 'Marketing', pages: [landing] },
      { key: '__lism-mockup:default__', label: 'Pages', pages: [home] },
      { key: 'Admin', label: 'Admin', pages: [dash, settings] },
    ]);
  });
});

describe('splitPinnedPage', () => {
  test('固定ページが無ければ screens はそのまま', () => {
    const pages = [page('home'), page('about', { category: 'Docs' })];
    expect(splitPinnedPage(pages)).toEqual({ all: pages, pinned: null, screens: pages });
  });

  test('components は UI Parts として分離し category を落とす', () => {
    const home = page('home');
    const components = page(PINNED_PAGE_ID, { label: 'Components', category: 'Docs' });
    const result = splitPinnedPage([home, components]);

    expect(result.pinned).toEqual({ ...components, label: 'UI Parts', category: undefined });
    expect(result.screens).toEqual([home]);
    expect(result.all).toEqual([home, result.pinned]);
  });
});

describe('isModifiedClick', () => {
  function click(overrides: Record<string, unknown> = {}) {
    return {
      defaultPrevented: false,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      button: 0,
      ...overrides,
    } as Parameters<typeof isModifiedClick>[0];
  }

  test('通常の左クリックは false', () => {
    expect(isModifiedClick(click())).toBe(false);
  });

  test('修飾キー・中クリック・defaultPrevented は true', () => {
    expect(isModifiedClick(click({ metaKey: true }))).toBe(true);
    expect(isModifiedClick(click({ ctrlKey: true }))).toBe(true);
    expect(isModifiedClick(click({ shiftKey: true }))).toBe(true);
    expect(isModifiedClick(click({ altKey: true }))).toBe(true);
    expect(isModifiedClick(click({ button: 1 }))).toBe(true);
    expect(isModifiedClick(click({ defaultPrevented: true }))).toBe(true);
  });
});

describe('viewer href / route', () => {
  test('buildPageHref は page をセットし view と embed を外す', () => {
    stubLocation('?view=tokens&embed=1&ref=nav');
    expect(buildPageHref('admin/users')).toBe('/preview?ref=nav&page=admin%2Fusers');
  });

  test('buildGalleryHref は page / view / embed を外す', () => {
    stubLocation('?page=home&view=tokens&embed=1&ref=nav');
    expect(buildGalleryHref()).toBe('/preview?ref=nav');
  });

  test('buildTokensHref は view=tokens をセットし page と embed を外す', () => {
    stubLocation('?page=home&embed=1&ref=nav');
    expect(buildTokensHref()).toBe('/preview?ref=nav&view=tokens');
  });

  test('buildEmbedSrc は page と embed=1 をセットする', () => {
    stubLocation('?view=tokens');
    expect(buildEmbedSrc('home')).toBe('/preview?page=home&embed=1');
  });

  test('readRouteFromUrl は page を view より優先する', () => {
    stubLocation();
    expect(readRouteFromUrl()).toEqual({ view: 'gallery' });

    stubLocation('?view=tokens');
    expect(readRouteFromUrl()).toEqual({ view: 'tokens' });

    stubLocation('?view=unknown');
    expect(readRouteFromUrl()).toEqual({ view: 'gallery' });

    stubLocation('?page=home&view=tokens');
    expect(readRouteFromUrl()).toEqual({ view: 'page', pageId: 'home', embed: false });

    stubLocation('?page=home&embed=1');
    expect(readRouteFromUrl()).toEqual({ view: 'page', pageId: 'home', embed: true });
  });
});
