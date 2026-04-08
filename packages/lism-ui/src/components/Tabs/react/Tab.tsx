import { Lism, type LismComponentProps } from 'lism-css/react';

type TabProps = LismComponentProps & {
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

export default function Tab({ tabId = 'tab', index = 0, isActive = false, ...props }: TabProps) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism as="button" lismClass="c--tabs_tab" setPlain role="tab" aria-controls={controlId} aria-selected={isActive ? 'true' : 'false'} {...props} />
  );
}
