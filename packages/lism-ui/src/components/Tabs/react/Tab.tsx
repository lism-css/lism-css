import { Lism, type LismComponentProps } from 'lism-css/react';
import { getTabProps } from '../getProps';

type TabProps = LismComponentProps & {
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

export default function Tab({ tabId = 'tab', index = 0, isActive = false, ...props }: TabProps) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      {...(getTabProps(props as Record<string, unknown>) as object)}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
    />
  );
}
