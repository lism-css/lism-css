'use client';
import { useRef, useEffect } from 'react';
import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { setEvent } from '../setModal';
import { getProps, type ModalRootProps } from '../getProps';

import '../_style.css';

const Modal = <T extends ElementType = 'dialog'>({ children, className, ...props }: ModalRootProps & LismComponentProps<T>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref?.current) return;
    return setEvent(ref?.current);
  }, [ref]);

  const { as: modalAs, ...modalProps } = getProps(props);
  return (
    <Lism as={modalAs as ElementType} forwardedRef={ref} className={atts(className, 'c--modal')} {...modalProps}>
      {children}
    </Lism>
  );
};
export default Modal;
