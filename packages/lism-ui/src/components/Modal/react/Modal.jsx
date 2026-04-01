'use client';
import { useRef, useEffect } from 'react';
import { Lism } from 'lism-css/react';
import { setEvent } from '../setModal';
import { getProps } from '../getProps';

import '../_style.css';

// duration: [s]
const Modal = ({ children, ...props }) => {
  const ref = useRef(null);
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
