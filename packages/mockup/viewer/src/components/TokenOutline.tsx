import { useState, type FocusEvent, type MouseEvent } from 'react';
import { Box, Flex, Inline, Stack } from 'lism-css/react';

/** Below this many groups the outline is not worth the screen space. */
const MIN_ITEMS = 2;

export interface OutlineItem {
  /** Group name, revealed when the outline is expanded. */
  label: string;
  /** DOM id of the section this entry scrolls to. */
  id: string;
}

interface TokenOutlineProps {
  items: OutlineItem[];
  /** Section the reader is on. See `lib/useActiveSection`. */
  activeId: string | null;
}

/**
 * Floating outline pinned to the middle of the right edge.
 *
 * Collapsed it is one dash per token group, and hovering or focusing it reveals
 * the group names. The token list is long enough that scrolling to a group by
 * hand is tedious, and the sidebar is already taken by the page navigation.
 */
export default function TokenOutline({ items, activeId }: TokenOutlineProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length < MIN_ITEMS) return null;

  const handleClick = (event: MouseEvent<HTMLElement>, id: string) => {
    // The viewer routes on query parameters, so the URL must not gain a hash.
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    // Moving between two entries blurs the first one, so the outline may only
    // collapse once focus has left it entirely.
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsOpen(false);
  };

  return (
    // `position: fixed` resolves against the viewport: nothing above the page
    // area sets a `transform` / `container-type` that would capture it.
    <Stack
      as="nav"
      className="z--mockupViewerOutline"
      aria-label="Token groups"
      pos="fixed"
      i-e="0"
      t="50%"
      z="1"
      p="10"
      g="0"
      ai="end"
      bgc={isOpen ? 'base' : undefined}
      bd={isOpen || undefined}
      bdrs="20"
      bxsh={isOpen ? '20' : undefined}
      hasTransition
      // The has--transition default list would also tween border-color when `bd`
      // appears, which makes the whole outline flash. Only the properties that
      // actually ease in and out are listed here.
      style={{ translate: '0 -50%', '--transitionProps': 'background-color, box-shadow' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={handleBlur}
    >
      {items.map((item) => {
        const isCurrent = item.id === activeId;

        return (
          <Flex
            key={item.id}
            as="a"
            href={`#${item.id}`}
            ai="center"
            jc="end"
            g="10"
            py="5"
            ps="10"
            bdrs="10"
            td="none"
            c={isCurrent ? 'text' : 'text-2'}
            hov={isOpen ? { bgc: 'base-2' } : undefined}
            hasTransition
            aria-current={isCurrent ? 'true' : undefined}
            onClick={(event: MouseEvent<HTMLElement>) => handleClick(event, item.id)}
          >
            {/* Kept in the accessibility tree while collapsed, so every entry
                keeps its name without a duplicated `aria-label`. */}
            <Inline className={isOpen ? undefined : 'u--srOnly'} fz="2xs" ff="mono" fw={isCurrent ? 'bold' : undefined} whs="nowrap">
              {item.label}
            </Inline>
            <Box
              fxsh="0"
              w={isCurrent ? '1.25rem' : '0.75rem'}
              h="2px"
              bdrs="99"
              bgc={isCurrent ? 'text' : 'divider'}
              hasTransition
              // `width` is outside the has--transition default list, so it is listed explicitly.
              style={{ '--transitionProps': 'width, background-color' }}
            />
          </Flex>
        );
      })}
    </Stack>
  );
}
