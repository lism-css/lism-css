'use client';
import { useRef, useEffect } from 'react';
import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { setEvent } from '../setModal';

import '../_style.css';

type ModalRootProps = { duration?: string };

const Modal = <T extends ElementType = 'dialog'>({
  children,
  className,
  set = 'plain',
  duration,
  style,
  ...props
}: ModalRootProps & LismComponentProps<T>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref?.current) return;
    return setEvent(ref?.current);
  }, [ref]);

  const mergedStyle = duration ? { ...style, '--duration': duration } : style;
  return (
    <Lism forwardedRef={ref} as="dialog" className={atts(className, 'c--modal')} set={set} style={mergedStyle} {...(props as object)}>
      {children}
    </Lism>
  );
};
export default Modal;
