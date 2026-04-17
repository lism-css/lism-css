import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function ModalBody<T extends ElementType = 'div'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism className={atts(className, 'c--modal_body')} {...(props as object)}>
      {children}
    </Lism>
  );
}
