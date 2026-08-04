import { Flex, Heading, Inline } from 'lism-css/react';
import { PanelLeftIcon } from 'lucide-react';

import IconButton from './IconButton';

interface ViewerHeaderProps {
  title: string;
  /** Label of the page currently on screen, if any. */
  currentLabel?: string;
  isNavOpen: boolean;
  onToggleNav: () => void;
  /** Id of the nav element the toggle controls. */
  navId: string;
}

export default function ViewerHeader({ title, currentLabel, isNavOpen, onToggleNav, navId }: ViewerHeaderProps) {
  return (
    <Flex as="header" className="z--mockupViewerHeader" fxsh="0" ai="center" px="20" py="10" bd-be>
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
    </Flex>
  );
}
