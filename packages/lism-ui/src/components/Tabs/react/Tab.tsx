import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type TabProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

export default function Tab<T extends ElementType = 'button'>({ tabId = 'tab', index = 0, isActive = false, className, ...props }: TabProps<T>) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      as="button"
      set="plain"
      className={atts(className, 'c--tabs_tab')}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
      {...(props as object)}
    />
  );
}
