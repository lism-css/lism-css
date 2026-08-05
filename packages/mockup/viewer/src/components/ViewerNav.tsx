import { useId, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { Flex, Icon, Stack, Text } from 'lism-css/react';
import { NavMenu } from '@lism-css/ui/react/NavMenu';
import { ComponentIcon, GalleryVerticalEndIcon, PaletteIcon } from 'lucide-react';
import type { ViewerPage } from 'virtual:lism-mockup/pages';

import type { PageGroup } from '../lib/groupPages';
import { isModifiedClick } from '../lib/isModifiedClick';
import { buildGalleryHref, buildPageHref, buildTokensHref, type ViewerRoute } from '../lib/useViewerRoute';
import { TOKENS_VIEW_LABEL } from './TokensView';

/** Heading of the group holding the viewer's own screens. */
const VIEWER_GROUP_LABEL = 'Viewer';

interface ViewerNavProps {
  id: string;
  /** When false the sidebar is hidden but stays mounted. */
  isOpen: boolean;
  /** The mockup's own screens by category, without the pinned page. */
  groups: PageGroup[];
  /** Listed in the viewer group instead of with the screens. See `lib/pinnedPage`. */
  pinnedPage: ViewerPage | null;
  route: ViewerRoute;
  onOpenGallery: () => void;
  onOpenTokens: () => void;
  onOpenPage: (pageId: string) => void;
}

/** Sidebar listing the viewer's own screens plus every page of the mockup. */
export default function ViewerNav({ id, isOpen, groups, pinnedPage, route, onOpenGallery, onOpenTokens, onOpenPage }: ViewerNavProps) {
  /** True while `pageId` is the page on screen. */
  const isCurrentPage = (pageId: string) => route.view === 'page' && pageId === route.pageId;

  // Each list is labelled by its own heading, so screen readers announce the group a
  // link belongs to. Category names come from `mockup.config.json` and may contain
  // spaces, which `aria-labelledby` reads as an id separator — hence generated ids
  // rather than ones derived from the label.
  const labelIdPrefix = useId();
  const groupLabelId = (suffix: string) => `${labelIdPrefix}nav-${suffix}`;

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
        <NavGroupLabel id={groupLabelId('viewer')}>{VIEWER_GROUP_LABEL}</NavGroupLabel>
        <NavMenu.Root itemP="15" aria-labelledby={groupLabelId('viewer')}>
          <NavLink href={buildTokensHref()} icon={PaletteIcon} isCurrent={route.view === 'tokens'} onSelect={onOpenTokens}>
            {TOKENS_VIEW_LABEL}
          </NavLink>
          {pinnedPage && (
            <NavLink
              href={buildPageHref(pinnedPage.id)}
              icon={ComponentIcon}
              isCurrent={isCurrentPage(pinnedPage.id)}
              onSelect={() => onOpenPage(pinnedPage.id)}
            >
              {pinnedPage.label}
            </NavLink>
          )}
          <NavLink href={buildGalleryHref()} icon={GalleryVerticalEndIcon} isCurrent={route.view === 'gallery'} onSelect={onOpenGallery}>
            All pages
          </NavLink>
        </NavMenu.Root>
      </Stack>
      {groups.map((group, index) => (
        <Stack key={group.key} g="5">
          <NavGroupLabel id={groupLabelId(String(index))}>{group.label}</NavGroupLabel>
          <NavMenu.Root itemP="15" aria-labelledby={groupLabelId(String(index))}>
            {group.pages.map((page) => (
              <NavLink key={page.id} href={buildPageHref(page.id)} isCurrent={isCurrentPage(page.id)} onSelect={() => onOpenPage(page.id)}>
                {page.label}
              </NavLink>
            ))}
          </NavMenu.Root>
        </Stack>
      ))}
    </Stack>
  );
}

/** Heading of a nav group. Its `id` labels the group's list. */
function NavGroupLabel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Text as="div" id={id} px="15" fz="2xs" fw="bold" c="text-2" tt="upper" lts="l">
      {children}
    </Text>
  );
}

interface NavLinkProps {
  href: string;
  /** Decorative icon displayed for the viewer's primary navigation. */
  icon?: ElementType;
  isCurrent: boolean;
  /** Runs on a plain click, after the default navigation has been cancelled. */
  onSelect: () => void;
  children: ReactNode;
}

function NavLink({ href, icon, isCurrent, onSelect, children }: NavLinkProps) {
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
        {icon ? (
          <Flex as="span" ai="center" g="10">
            <Icon icon={{ as: icon, size: '1em' }} />
            {children}
          </Flex>
        ) : (
          children
        )}
      </NavMenu.Link>
    </NavMenu.Item>
  );
}
