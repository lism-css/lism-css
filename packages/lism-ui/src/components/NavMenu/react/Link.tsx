import type { ElementType } from 'react';
import { Flex, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type LinkProps = LismComponentProps<ElementType> & { href?: string };

export default function Link({ children, className, as = 'span', ...props }: LinkProps) {
  return (
    <Flex as={props.href ? 'a' : as} className={atts(className, 'c--navMenu_link')} c="inherit" {...props}>
      {children}
    </Flex>
  );
}
