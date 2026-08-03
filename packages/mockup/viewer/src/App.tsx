import { useEffect, useState } from 'react';
import { Flex, Group, Stack } from 'lism-css/react';
import { pages, title } from 'virtual:lism-mockup/pages';

import EmptyState from './components/EmptyState';
import PageView from './components/PageView';
import ViewerHeader from './components/ViewerHeader';
import ViewerNav from './components/ViewerNav';
import { usePageId } from './lib/usePageId';
import { useTheme } from './lib/useTheme';

/** Fallback used when `mockup.config.json` does not declare a `title`. */
const DEFAULT_TITLE = 'Lism Mockup';

/** Id used to wire the header toggle to the sidebar (`aria-controls`). */
const NAV_ID = 'mockupViewerNav';

export default function App() {
  const viewerTitle = title?.trim() ? title : DEFAULT_TITLE;

  const { pageId, selectPage } = usePageId(pages);
  const { isDark, toggleTheme } = useTheme();
  const [isNavOpen, setIsNavOpen] = useState(true);

  // `find` returns the element from `pages`, so the identity stays stable across
  // renders and can safely be used as an effect dependency.
  const currentPage = pages.find((page) => page.id === pageId) ?? null;

  useEffect(() => {
    document.title = currentPage ? `${currentPage.label} | ${viewerTitle}` : viewerTitle;
  }, [currentPage, viewerTitle]);

  return (
    // The shell owns the viewport: header + sidebar stay put while only the page
    // area scrolls. `is--container` is deliberately NOT used anywhere above the
    // page area, because `container-type` would become a containing block for a
    // mockup's `position: fixed` elements.
    // `100dvh` matches the `min-height: 100dvh` the base styles put on <body>,
    // so the document itself never gains a second scrollbar.
    <Stack className="z--mockupViewer" h="100dvh" ov="hidden">
      <ViewerHeader
        title={viewerTitle}
        currentLabel={currentPage?.label}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isNavOpen={isNavOpen}
        onToggleNav={() => setIsNavOpen((open) => !open)}
        navId={NAV_ID}
      />
      {/* `min-h:0` lets this row shrink inside the fixed-height shell so its
          children can own the scrolling instead of pushing the shell taller. */}
      <Flex className="z--mockupViewerBody" fxg="1" min-h="0">
        {/* Kept mounted while hidden so `aria-controls` stays valid and the
            sidebar keeps its scroll position. */}
        <ViewerNav id={NAV_ID} isOpen={isNavOpen} pages={pages} currentPageId={pageId} onSelect={selectPage} />
        {/* No padding / background here: the mockup page must look exactly as authored. */}
        <Group as="main" className="z--mockupViewerMain" fxg="1" ov-y="auto">
          {currentPage ? <PageView page={currentPage} /> : <EmptyState pages={pages} requestedPageId={pageId} />}
        </Group>
      </Flex>
    </Stack>
  );
}
