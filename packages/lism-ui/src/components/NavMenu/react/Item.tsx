import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function Item<T extends ElementType = 'li'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism as="li" className={atts(className, 'b--navMenu_item')} {...(props as object)}>
      {children}
    </Lism>
  );
}
