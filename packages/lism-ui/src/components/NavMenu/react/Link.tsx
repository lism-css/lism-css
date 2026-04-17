import type { ElementType } from 'react';
import { Flex, type LayoutComponentProps } from 'lism-css/react';
import type { FlexProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';

type LinkProps = LayoutComponentProps<ElementType, FlexProps> & { href?: string };

export default function Link({ children, className, ...props }: LinkProps) {
  return (
    <Flex as="a" className={atts(className, 'c--navMenu_link')} c="inherit" {...(props as object)}>
      {children}
    </Flex>
  );
}
