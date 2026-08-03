import type { ElementType } from 'react';
import { Center, Icon } from 'lism-css/react';

interface IconButtonProps {
  /** Icon component (a lucide-react icon). */
  icon: ElementType;
  /** Accessible name. Also used as the tooltip. */
  label: string;
  onClick: () => void;
  /** Rendered as `aria-expanded` when the button controls a disclosure. */
  isExpanded?: boolean;
  /** Id of the element this button controls. */
  controls?: string;
}

/** Square icon-only button used in the viewer header. */
export default function IconButton({ icon, label, onClick, isExpanded, controls }: IconButtonProps) {
  return (
    <Center
      as="button"
      type="button"
      set="plain"
      className="z--mockViewerIconBtn"
      p="10"
      bd
      bdrs="10"
      bgc="base"
      hov={{ bgc: 'base-2' }}
      hasTransition
      aria-label={label}
      aria-expanded={isExpanded}
      aria-controls={controls}
      title={label}
      onClick={onClick}
    >
      <Icon icon={{ as: icon, size: '1.25em' }} />
    </Center>
  );
}
