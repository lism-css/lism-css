import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { getInnerProps, type ModalInnerProps } from '../getProps';

export default function ModalInner({ children, className, ...props }: ModalInnerProps & LismComponentProps) {
  return (
    <Lism {...getInnerProps(props)} className={atts(className, 'c--modal_inner')}>
      {children}
    </Lism>
  );
}
