import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

export default function ModalBody({ children, className, ...props }: LismComponentProps) {
  return (
    <Lism className={atts(className, 'c--modal_body')} {...props}>
      {children}
    </Lism>
  );
}
