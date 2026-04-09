'use client';
import { useRef, useEffect } from 'react';
import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { setEvent } from '../setModal';
import { getProps, type ModalRootProps } from '../getProps';

import '../_style.css';

const Modal = <T extends ElementType = 'dialog'>({ children, ...props }: ModalRootProps & LismComponentProps<T>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref?.current) return;
    return setEvent(ref?.current);
  }, [ref]);

  const { as: modalAs, ...modalProps } = getProps(props);
  return (
    <Lism as={modalAs as ElementType} forwardedRef={ref} {...modalProps}>
      {children}
    </Lism>
  );
};
export default Modal;
