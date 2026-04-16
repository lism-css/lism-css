import atts from 'lism-css/lib/helper/atts';
import { Stack, type LismComponentProps } from 'lism-css/react';

import '../_style.css';

type AccordionRootProps = { allowMultiple?: boolean };

/**
 * 複数の AccordionItem をラップするルート要素
 */
export default function Root({ children, className, allowMultiple, ...props }: AccordionRootProps & LismComponentProps) {
  return (
    <Stack className={atts(className, 'c--accordion')} data-allow-multiple={allowMultiple ? '' : undefined} {...props}>
      {children}
    </Stack>
  );
}
