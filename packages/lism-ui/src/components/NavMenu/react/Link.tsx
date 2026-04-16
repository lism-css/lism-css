import { Flex, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type LinkProps = LismComponentProps & { href?: string };

export default function Link({ children, className, ...props }: LinkProps) {
  return (
    <Flex as={props.href ? 'a' : 'span'} className={atts(className, 'c--navMenu_link')} c="inherit" {...props}>
      {children}
    </Flex>
  );
}
