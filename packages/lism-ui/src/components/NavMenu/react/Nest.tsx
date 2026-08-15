import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function Nest<T extends ElementType = 'ul'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism as="ul" className={atts(className, 'b--navMenu_nest')} {...(props as object)}>
      {children}
    </Lism>
  );
}
