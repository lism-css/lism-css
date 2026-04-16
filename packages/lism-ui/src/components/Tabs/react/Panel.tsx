import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type TabPanelProps = LismComponentProps & {
  tabId?: string;
  isActive?: boolean;
  index?: number;
};

export default function TabPanel({ tabId = 'tab', isActive = false, index = 0, className, ...props }: TabPanelProps) {
  const controlId = `${tabId}-${index}`;

  return <Lism id={controlId} role="tabpanel" aria-hidden={isActive ? 'false' : 'true'} className={atts(className, 'c--tabs_panel')} {...props} />;
}
