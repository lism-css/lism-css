import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type TabProps = LismComponentProps & {
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

export default function Tab({ tabId = 'tab', index = 0, isActive = false, className, ...props }: TabProps) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      as="button"
      set="plain"
      className={atts(className, 'c--tabs_tab')}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
      {...props}
    />
  );
}
