import { Flex, Heading, Inline } from 'lism-css/react';
import { MoonIcon, PanelLeftIcon, SunIcon } from 'lucide-react';

import IconButton from './IconButton';

interface ViewerHeaderProps {
  title: string;
  /** Label of the page currently on screen, if any. */
  currentLabel?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  isNavOpen: boolean;
  onToggleNav: () => void;
  /** Id of the nav element the toggle controls. */
  navId: string;
}

export default function ViewerHeader({ title, currentLabel, isDark, onToggleTheme, isNavOpen, onToggleNav, navId }: ViewerHeaderProps) {
  return (
    <Flex as="header" className="z--mockViewerHeader" fxsh="0" ai="center" jc="between" g="20" px="20" py="10" bd-be>
      <Flex ai="center" g="15">
        <IconButton
          icon={PanelLeftIcon}
          label={isNavOpen ? 'Hide page list' : 'Show page list'}
          onClick={onToggleNav}
          isExpanded={isNavOpen}
          controls={navId}
        />
        <Flex ai="baseline" g="10" fxw="wrap">
          <Heading level="1" fz="m" ovw="anywhere">
            {title}
          </Heading>
          {currentLabel && (
            <Inline fz="xs" c="text-2" ovw="anywhere">
              {currentLabel}
            </Inline>
          )}
        </Flex>
      </Flex>
      <IconButton icon={isDark ? SunIcon : MoonIcon} label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={onToggleTheme} />
    </Flex>
  );
}
