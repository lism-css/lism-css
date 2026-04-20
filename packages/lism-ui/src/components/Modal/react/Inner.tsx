import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type ModalInnerProps<T extends ElementType = 'div'> = LismComponentProps<T> & { offset?: string };

export default function ModalInner<T extends ElementType = 'div'>({ children, className, offset, style, ...props }: ModalInnerProps<T>) {
  const mergedStyle = offset ? { ...style, '--offset': offset } : style;
  return (
    <Lism className={atts(className, 'c--modal_inner')} style={mergedStyle} {...(props as object)}>
      {children}
    </Lism>
  );
}
