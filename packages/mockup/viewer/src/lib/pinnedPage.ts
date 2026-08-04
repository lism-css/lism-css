import type { ViewerPage } from 'virtual:lism-mockup/pages';

/**
 * Page id the viewer pins next to its own screens.
 *
 * The UI parts index is authored as an ordinary page (`pages/components.jsx`),
 * but it documents the mockup instead of being one of its screens. The viewer
 * therefore lifts it out of the page list and shows it in its own group, right
 * below the token list — the sidebar groups and the gallery keep showing the
 * actual screens only. A mockup without that page simply gets no such entry, and
 * its `category` / `order` in `mockup.config.json` are ignored while it has one.
 */
export const PINNED_PAGE_ID = 'components';

export interface SplitPages {
  /** The pinned page, or `null` when the mockup does not have one. */
  pinned: ViewerPage | null;
  /** Every remaining page, in the order it arrived. */
  screens: ViewerPage[];
}

/** Separates the pinned page from the mockup's own screens. */
export function splitPinnedPage(pages: ViewerPage[]): SplitPages {
  return {
    pinned: pages.find((page) => page.id === PINNED_PAGE_ID) ?? null,
    screens: pages.filter((page) => page.id !== PINNED_PAGE_ID),
  };
}
