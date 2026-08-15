import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type OpenBtnProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  modalId?: string;
};

export default function OpenBtn<T extends ElementType = 'button'>({ children, className, modalId = '', ...props }: OpenBtnProps<T>) {
  return (
    <Lism as="button" className={atts(className, 'b--modal_openBtn')} set="plain" hov="-o" data-modal-open={modalId} {...(props as object)}>
      {children}
    </Lism>
  );
}
