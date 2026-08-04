import type { MouseEvent, ReactNode } from 'react';
import { Stack, Text } from 'lism-css/react';
import { NavMenu } from '@lism-css/ui/react/NavMenu';
import type { ViewerPage } from 'virtual:lism-mockup/pages';

import { groupPages } from '../lib/groupPages';
import { isModifiedClick } from '../lib/isModifiedClick';
import { buildGalleryHref, buildPageHref, buildTokensHref, type ViewerRoute } from '../lib/useViewerRoute';
import { galleryCardId } from './GalleryView';
import { TOKENS_VIEW_LABEL } from './TokensView';

/** Heading of the group holding the viewer's own screens. */
const VIEWER_GROUP_LABEL = 'Viewer';

interface ViewerNavProps {
  id: string;
  /** When false the sidebar is hidden but stays mounted. */
  isOpen: boolean;
  pages: ViewerPage[];
  route: ViewerRoute;
  onOpenGallery: () => void;
  onOpenTokens: () => void;
  onOpenPage: (pageId: string) => void;
}

/** Sidebar listing the viewer's own screens plus every page of the mockup. */
export default function ViewerNav({ id, isOpen, pages, route, onOpenGallery, onOpenTokens, onOpenPage }: ViewerNavProps) {
  const groups = groupPages(pages);

  /**
   * While the gallery is open every page is already on screen, so a page link
   * scrolls to its card instead of navigating. No history entry is pushed: the
   * `href` still points at the single page view, so opening the link in a new tab
   * (or any modified click) keeps working as before.
   */
  const handlePageClick = (pageId: string) => {
    if (route.view !== 'gallery') {
      onOpenPage(pageId);
      return;
    }
    document.getElementById(galleryCardId(pageId))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Stack
      as="nav"
      id={id}
      className="z--mockupViewerNav"
      aria-label="Mockup navigation"
      d={isOpen ? undefined : 'none'}
      fxsh="0"
      w="16rem"
      ov-y="auto"
      py="20"
      g="25"
      bd-e
    >
      <Stack g="5">
        <NavGroupLabel>{VIEWER_GROUP_LABEL}</NavGroupLabel>
        <NavMenu.Root itemP="15">
          <NavLink href={buildGalleryHref()} isCurrent={route.view === 'gallery'} onSelect={onOpenGallery}>
            All pages
          </NavLink>
          <NavLink href={buildTokensHref()} isCurrent={route.view === 'tokens'} onSelect={onOpenTokens}>
            {TOKENS_VIEW_LABEL}
          </NavLink>
        </NavMenu.Root>
      </Stack>
      {groups.map((group) => (
        <Stack key={group.key} g="5">
          <NavGroupLabel>{group.label}</NavGroupLabel>
          <NavMenu.Root itemP="15">
            {group.pages.map((page) => (
              <NavLink
                key={page.id}
                href={buildPageHref(page.id)}
                isCurrent={route.view === 'page' && page.id === route.pageId}
                onSelect={() => handlePageClick(page.id)}
              >
                {page.label}
              </NavLink>
            ))}
          </NavMenu.Root>
        </Stack>
      ))}
    </Stack>
  );
}

function NavGroupLabel({ children }: { children: ReactNode }) {
  return (
    <Text as="div" px="15" fz="2xs" fw="bold" c="text-2" tt="upper" lts="l">
      {children}
    </Text>
  );
}

interface NavLinkProps {
  href: string;
  isCurrent: boolean;
  /** Runs on a plain click, after the default navigation has been cancelled. */
  onSelect: () => void;
  children: ReactNode;
}

function NavLink({ href, isCurrent, onSelect, children }: NavLinkProps) {
  return (
    <NavMenu.Item>
      <NavMenu.Link
        href={href}
        aria-current={isCurrent ? 'page' : undefined}
        fz="s"
        fw={isCurrent ? 'bold' : undefined}
        bgc={isCurrent ? 'base-2' : undefined}
        ovw="anywhere"
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (isModifiedClick(event)) return;
          event.preventDefault();
          onSelect();
        }}
      >
        {children}
      </NavMenu.Link>
    </NavMenu.Item>
  );
}
