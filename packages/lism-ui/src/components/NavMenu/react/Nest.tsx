import type { ElementType } from 'react';
import { Stack, type LayoutComponentProps } from 'lism-css/react';
import type { StackProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';

export default function Nest<T extends ElementType = 'ul'>({ children, className, ...props }: LayoutComponentProps<T, StackProps>) {
  return (
    <Stack as="ul" className={atts(className, 'c--navMenu_nest')} px-s="20" {...(props as object)}>
      {children}
    </Stack>
  );
}
