import { useCallback, useEffect, useState } from 'react';
import type { ViewerPage } from 'virtual:lism-mockup/pages';

/** Query parameter that holds the currently displayed page id. */
export const PAGE_QUERY_KEY = 'page';

function readPageIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get(PAGE_QUERY_KEY);
}

/** Builds a same-document URL that points at `pageId`. */
export function buildPageHref(pageId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set(PAGE_QUERY_KEY, pageId);
  return `${url.pathname}${url.search}${url.hash}`;
}

export interface PageIdState {
  /** Page id taken from the URL. `null` only while no page has been resolved yet. */
  pageId: string | null;
  /** Navigates to a page and pushes a history entry so Back/Forward work. */
  selectPage: (pageId: string) => void;
}

/**
 * Keeps the displayed page id in sync with `?page=` in the URL.
 *
 * - Selecting a page pushes a history entry, so every screen has a shareable URL.
 * - `popstate` (Back / Forward) re-reads the URL instead of keeping local state.
 * - When the URL has no `?page=`, the first page is selected and the URL is
 *   rewritten with `replaceState` so the address bar always matches the screen.
 *   An unknown id is left untouched so typos stay visible to the user.
 */
export function usePageId(pages: ViewerPage[]): PageIdState {
  const [pageId, setPageId] = useState<string | null>(() => readPageIdFromUrl());

  useEffect(() => {
    const handlePopState = () => setPageId(readPageIdFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (pageId !== null) return;
    const firstPage = pages[0];
    if (!firstPage) return;

    window.history.replaceState(null, '', buildPageHref(firstPage.id));
    setPageId(firstPage.id);
  }, [pageId, pages]);

  const selectPage = useCallback((nextPageId: string) => {
    if (nextPageId === readPageIdFromUrl()) return;
    window.history.pushState(null, '', buildPageHref(nextPageId));
    setPageId(nextPageId);
  }, []);

  return { pageId, selectPage };
}
