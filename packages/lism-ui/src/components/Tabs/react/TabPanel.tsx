import { Lism, type LismComponentProps } from 'lism-css/react';

type TabPanelProps = LismComponentProps & {
  tabId?: string;
  isActive?: boolean;
  index?: number;
};

export default function TabPanel({ tabId = 'tab', isActive = false, index = 0, ...props }: TabPanelProps) {
  const controlId = `${tabId}-${index}`;

  return <Lism id={controlId} role="tabpanel" aria-hidden={isActive ? 'false' : 'true'} lismClass="c--tabs_panel" {...props} />;
}
