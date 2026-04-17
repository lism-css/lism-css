import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function TabList<T extends ElementType = 'div'>({ className, ...props }: LismComponentProps<T>) {
  return <Lism role="tablist" className={atts(className, 'c--tabs_list')} {...(props as object)} />;
}
