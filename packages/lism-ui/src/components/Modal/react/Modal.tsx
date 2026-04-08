'use client';
import { useRef, useEffect } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { setEvent } from '../setModal';
import { getProps, type ModalRootProps } from '../getProps';

import '../_style.css';

const Modal = ({ children, ...props }: ModalRootProps & LismComponentProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref?.current) return;
    return setEvent(ref?.current);
  }, [ref]);

  return (
    <Lism forwardedRef={ref} {...getProps(props)}>
      {children}
    </Lism>
  );
};
export default Modal;
