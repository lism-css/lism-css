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
 * any `label` / `category` / `order` written for it is ignored — see
 * `splitPinnedPage()` for how that is enforced.
 */
const PINNED_PAGE_LABEL = 'UI Parts';

export interface SplitPages {
  /** Every page, the pinned one normalized as described above. */
  all: ViewerPage[];
  /** The pinned page, or `null` when the mockup does not have one. */
  pinned: ViewerPage | null;
  /** Every remaining page, in the order it arrived. */
  screens: ViewerPage[];
}

/** Separates the pinned page from the mockup's own screens. */
export function splitPinnedPage(pages: ViewerPage[]): SplitPages {
  // The viewer decides where the pinned page goes, so its own `category` is dropped
  // along with the label being fixed: whatever `mockup.config.json` says about it, it
  // can never end up in a category group. (`order` never reaches the viewer — the CLI
  // only uses it to sort `pages`, and the pinned page is lifted out of that list here.)
  const all = pages.map((page) => (page.id === PINNED_PAGE_ID ? { ...page, label: PINNED_PAGE_LABEL, category: undefined } : page));

  return {
    all,
    pinned: all.find((page) => page.id === PINNED_PAGE_ID) ?? null,
    screens: all.filter((page) => page.id !== PINNED_PAGE_ID),
  };
}
