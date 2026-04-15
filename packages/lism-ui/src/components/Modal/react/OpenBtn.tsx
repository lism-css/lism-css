import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';

type OpenBtnProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  modalId?: string;
};

export default function OpenBtn<T extends ElementType = 'button'>({ children, modalId = '', ...props }: OpenBtnProps<T>) {
  return (
    <Lism as="button" set="plain" hov="o" d="inline-flex" data-modal-open={modalId} {...(props as object)}>
      {children}
    </Lism>
  );
}
