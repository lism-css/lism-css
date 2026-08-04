import type { ViewerPage } from 'virtual:lism-mockup/pages';

/**
 * Page id the viewer pins next to its own screens.
 *
 * The UI parts index is authored as an ordinary page (`pages/components.jsx`),
 * but it documents the mockup instead of being one of its screens. The viewer
 * therefore lifts it out of the page list and shows it in its own group, right
 * below the token list — the sidebar groups and the gallery keep showing the
 * actual screens only. A mockup without that page simply gets no such entry.
 */
export const PINNED_PAGE_ID = 'components';

/**
 * Label of the pinned page.
 *
 * Fixed by the viewer, exactly like the token list's: the page belongs to the
 * viewer's own group, so `mockup.config.json` does not describe it at all and
 * any `label` / `category` / `order` written for it is ignored.
 */
const PINNED_PAGE_LABEL = 'UI Parts';

export interface SplitPages {
  /** Every page, the pinned one carrying the label above. */
  all: ViewerPage[];
  /** The pinned page, or `null` when the mockup does not have one. */
  pinned: ViewerPage | null;
  /** Every remaining page, in the order it arrived. */
  screens: ViewerPage[];
}

/** Separates the pinned page from the mockup's own screens. */
export function splitPinnedPage(pages: ViewerPage[]): SplitPages {
  const all = pages.map((page) => (page.id === PINNED_PAGE_ID ? { ...page, label: PINNED_PAGE_LABEL } : page));

  return {
    all,
    pinned: all.find((page) => page.id === PINNED_PAGE_ID) ?? null,
    screens: all.filter((page) => page.id !== PINNED_PAGE_ID),
  };
}
