import { useCallback, useEffect, useState } from 'react';

/** Query parameter that holds the id of the page to display. */
export const PAGE_QUERY_KEY = 'page';

/** Query parameter that selects one of the viewer's own screens. */
export const VIEW_QUERY_KEY = 'view';

/** Query parameter that strips the viewer shell (used by the gallery previews). */
export const EMBED_QUERY_KEY = 'embed';

/** `?view=` value of the token list. Pages are addressed with `?page=` instead. */
const TOKENS_VIEW_VALUE = 'tokens';

/** `?embed=` value that turns embedded mode on. */
const EMBED_ON_VALUE = '1';

/**
 * What the viewer currently shows.
 *
 * `embed` only exists on the page route: it is the mode the gallery loads inside
 * its iframes, where the page must own the whole viewport again.
 */
export type ViewerRoute = { view: 'gallery' } | { view: 'tokens' } | { view: 'page'; pageId: string; embed: boolean };

function readRouteFromUrl(): ViewerRoute {
  const params = new URLSearchParams(window.location.search);

  // `?page=` wins over `?view=`: a page is always addressed by its id, so an
  // unknown `?view=` value next to it must not hide the page.
  const pageId = params.get(PAGE_QUERY_KEY);
  if (pageId !== null) {
    return { view: 'page', pageId, embed: params.get(EMBED_QUERY_KEY) === EMBED_ON_VALUE };
  }

  return params.get(VIEW_QUERY_KEY) === TOKENS_VIEW_VALUE ? { view: 'tokens' } : { view: 'gallery' };
}

/**
 * Builds a same-document URL from the current one.
 *
 * Everything the route does not own (pathname, hash, unrelated query parameters)
 * is kept, so the viewer can be served from any path.
 */
function buildHref(update: (params: URLSearchParams) => void): string {
  const url = new URL(window.location.href);
  update(url.searchParams);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Builds a URL that shows `pageId` on its own, inside the viewer shell. */
export function buildPageHref(pageId: string): string {
  return buildHref((params) => {
    params.set(PAGE_QUERY_KEY, pageId);
    params.delete(VIEW_QUERY_KEY);
    params.delete(EMBED_QUERY_KEY);
  });
}

/** Builds a URL that shows the gallery. A URL without parameters already is one. */
export function buildGalleryHref(): string {
  return buildHref((params) => {
    params.delete(PAGE_QUERY_KEY);
    params.delete(EMBED_QUERY_KEY);
    params.delete(VIEW_QUERY_KEY);
  });
}

/** Builds a URL that shows the token list. */
export function buildTokensHref(): string {
  return buildHref((params) => {
    params.set(VIEW_QUERY_KEY, TOKENS_VIEW_VALUE);
    params.delete(PAGE_QUERY_KEY);
    params.delete(EMBED_QUERY_KEY);
  });
}

/** Builds the `src` of a gallery preview: the same page, but without the shell. */
export function buildEmbedSrc(pageId: string): string {
  return buildHref((params) => {
    params.set(PAGE_QUERY_KEY, pageId);
    params.set(EMBED_QUERY_KEY, EMBED_ON_VALUE);
    params.delete(VIEW_QUERY_KEY);
  });
}

export interface ViewerRouteState {
  /** The route the URL currently describes. */
  route: ViewerRoute;
  /** Shows one page on its own. */
  openPage: (pageId: string) => void;
  /** Shows the gallery. */
  openGallery: () => void;
  /** Shows the token list. */
  openTokens: () => void;
}

/**
 * Keeps the displayed view in sync with the URL.
 *
 * - Navigating pushes a history entry, so every screen has a shareable URL.
 * - `popstate` (Back / Forward) re-reads the URL instead of keeping local state.
 * - A URL without parameters already is the gallery, so nothing is ever rewritten
 *   with `replaceState`. An unknown page id is left untouched as well, so typos
 *   stay visible to the user instead of silently redirecting.
 */
export function useViewerRoute(): ViewerRouteState {
  const [route, setRoute] = useState<ViewerRoute>(readRouteFromUrl);

  useEffect(() => {
    const handlePopState = () => setRoute(readRouteFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((href: string) => {
    // Re-selecting the current screen must not stack duplicate history entries.
    if (href === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;

    window.history.pushState(null, '', href);
    setRoute(readRouteFromUrl());
  }, []);

  const openPage = useCallback((pageId: string) => navigate(buildPageHref(pageId)), [navigate]);
  const openGallery = useCallback(() => navigate(buildGalleryHref()), [navigate]);
  const openTokens = useCallback(() => navigate(buildTokensHref()), [navigate]);

  return { route, openPage, openGallery, openTokens };
}
