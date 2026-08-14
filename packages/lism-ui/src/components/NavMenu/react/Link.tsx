import type { ElementType } from 'react';
import { Link as LinkBase, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type LinkProps = LismComponentProps<ElementType> & { href?: string };

export default function Link({ children, className, ...props }: LinkProps) {
  return (
    <LinkBase className={atts(className, 'b--navMenu_link')} hov="-bgc" {...(props as object)}>
      {children}
    </LinkBase>
  );
}
