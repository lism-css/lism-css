import type { MouseEvent } from 'react';
import { Stack, Text } from 'lism-css/react';
import { NavMenu } from '@lism-css/ui/react/NavMenu';
import type { ViewerPage } from 'virtual:lism-mock/pages';

import { groupPages } from '../lib/groupPages';
import { buildPageHref } from '../lib/usePageId';

interface ViewerNavProps {
  id: string;
  /** When false the sidebar is hidden but stays mounted. */
  isOpen: boolean;
  pages: ViewerPage[];
  currentPageId: string | null;
  onSelect: (pageId: string) => void;
}

/** Returns true when the browser should handle the click itself (new tab etc.). */
function isModifiedClick(event: MouseEvent<HTMLElement>): boolean {
  return event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/** Sidebar listing every page of the mock, grouped by category. */
export default function ViewerNav({ id, isOpen, pages, currentPageId, onSelect }: ViewerNavProps) {
  const groups = groupPages(pages);

  return (
    <Stack
      as="nav"
      id={id}
      className="z--mockViewerNav"
      aria-label="Mock pages"
      d={isOpen ? undefined : 'none'}
      fxsh="0"
      w="16rem"
      ov-y="auto"
      py="20"
      g="25"
      bd-e
    >
      {groups.map((group) => (
        <Stack key={group.key} g="5">
          <Text as="div" px="15" fz="2xs" fw="bold" c="text-2" tt="upper" lts="l">
            {group.label}
          </Text>
          <NavMenu.Root itemP="15">
            {group.pages.map((page) => {
              const isCurrent = page.id === currentPageId;
              return (
                <NavMenu.Item key={page.id}>
                  <NavMenu.Link
                    href={buildPageHref(page.id)}
                    aria-current={isCurrent ? 'page' : undefined}
                    fz="s"
                    fw={isCurrent ? 'bold' : undefined}
                    bgc={isCurrent ? 'base-2' : undefined}
                    ovw="anywhere"
                    onClick={(event: MouseEvent<HTMLElement>) => {
                      if (isModifiedClick(event)) return;
                      event.preventDefault();
                      onSelect(page.id);
                    }}
                  >
                    {page.label}
                  </NavMenu.Link>
                </NavMenu.Item>
              );
            })}
          </NavMenu.Root>
        </Stack>
      ))}
    </Stack>
  );
}
