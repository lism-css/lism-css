import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { getOpenBtnProps } from '../getProps';

type OpenBtnProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  modalId?: string;
};

export default function OpenBtn<T extends ElementType = 'button'>({ children, modalId = '', ...props }: OpenBtnProps<T>) {
  return (
    <Lism data-modal-open={modalId} {...(getOpenBtnProps(props as Record<string, unknown>) as object)}>
      {children}
    </Lism>
  );
}
