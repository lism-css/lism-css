import { Suspense, lazy, useMemo, type ComponentType, type LazyExoticComponent } from 'react';
import { Center, Text } from 'lism-css/react';
import type { ViewerPage } from 'virtual:lism-mockup/pages';

import PageErrorBoundary from './PageErrorBoundary';

type PageLoader = ViewerPage['load'];

/**
 * `lazy()` must not be called during render, otherwise every re-render would
 * remount the page. The cache is keyed by the loader function itself, so a
 * regenerated `virtual:lism-mockup/pages` (new loaders) transparently invalidates
 * the previous entries.
 */
const lazyPages = new WeakMap<PageLoader, LazyExoticComponent<ComponentType>>();

function getLazyPage(load: PageLoader): LazyExoticComponent<ComponentType> {
  const cached = lazyPages.get(load);
  if (cached) return cached;

  const created = lazy(load);
  lazyPages.set(load, created);
  return created;
}

/** Renders one mockup page, isolated behind Suspense and an error boundary. */
export default function PageView({ page }: { page: ViewerPage }) {
  const LazyPage = useMemo(() => getLazyPage(page.load), [page.load]);

  return (
    <PageErrorBoundary key={page.id} pageId={page.id}>
      <Suspense
        fallback={
          <Center p="40">
            <Text fz="s" c="text-2">
              Loading “{page.label}” …
            </Text>
          </Center>
        }
      >
        <LazyPage />
      </Suspense>
    </PageErrorBoundary>
  );
}
