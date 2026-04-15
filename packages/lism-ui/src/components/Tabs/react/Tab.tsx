import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { defaultProps } from '../getProps';

type TabProps = LismComponentProps & {
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

export default function Tab({ tabId = 'tab', index = 0, isActive = false, className, ...props }: TabProps) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      {...(defaultProps.tab as object)}
      {...(props as object)}
      className={atts(className, 'c--tabs_tab')}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
    />
  );
}
