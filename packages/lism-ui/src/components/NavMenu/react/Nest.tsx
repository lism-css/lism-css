import type { ElementType } from 'react';
import { Stack, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function Nest<T extends ElementType = 'ul'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Stack as="ul" className={atts(className, 'c--navMenu_nest')} px-s="20" {...(props as object)}>
      {children}
    </Stack>
  );
}
