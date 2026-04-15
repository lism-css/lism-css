import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function TabList({ className, ...props }: LismComponentProps) {
  return <Lism role="tablist" {...props} className={atts(className, 'c--tabs_list')} />;
}
