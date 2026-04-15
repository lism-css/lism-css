import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function Item({ children, className, ...props }: LismComponentProps) {
  return (
    <Lism as="li" className={atts(className, 'c--navMenu_item')} {...props}>
      {children}
    </Lism>
  );
}
