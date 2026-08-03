import { Inline, List, Stack, Text } from 'lism-css/react';
import { Alert } from '@lism-css/ui/react/Alert';
import type { ViewerPage } from 'virtual:lism-mock/pages';

import { buildPageHref } from '../lib/usePageId';

interface EmptyStateProps {
  pages: ViewerPage[];
  /** The `?page=` value that could not be matched, if there was one. */
  requestedPageId: string | null;
}

/** Shown when there is nothing to render: no pages at all, or an unknown page id. */
export default function EmptyState({ pages, requestedPageId }: EmptyStateProps) {
  if (pages.length === 0) {
    return (
      <Stack p="30">
        <Alert type="warning">
          <Text>
            No pages were found. Add a <Inline as="code">.jsx</Inline> or <Inline as="code">.tsx</Inline> file under <Inline as="code">pages/</Inline>{' '}
            in the mock data directory.
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack p="30" g="20">
      <Alert type="warning">
        <Text>Unknown page id{requestedPageId ? <>: “{requestedPageId}”</> : null}. Pick one of the pages below.</Text>
      </Alert>
      <List set="revert" ps="20">
        {pages.map((page) => (
          <li key={page.id}>
            <a href={buildPageHref(page.id)}>{page.label}</a>{' '}
            <Inline fz="xs" c="text-2" ff="mono">
              ({page.id})
            </Inline>
          </li>
        ))}
      </List>
    </Stack>
  );
}
