import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

import '../_style.css';

type DetailsRootProps<T extends ElementType = 'details'> = LismComponentProps<T> & { open?: boolean };

export default function Details<T extends ElementType = 'details'>({ children, open, className, ...props }: DetailsRootProps<T>) {
  return (
    <Lism as="details" open={open} className={atts(className, 'b--details')} {...(props as object)}>
      {children}
    </Lism>
  );
}
