import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Stack, type LismComponentProps } from 'lism-css/react';

import '../_style.css';

type AccordionRootProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
  allowMultiple?: boolean;
};

/**
 * 複数の AccordionItem をラップするルート要素
 */
export default function Root<T extends ElementType = 'div'>({ children, className, allowMultiple, ...props }: AccordionRootProps<T>) {
  return (
    <Stack className={atts(className, 'c--accordion')} data-allow-multiple={allowMultiple ? '' : undefined} {...(props as object)}>
      {children}
    </Stack>
  );
}
