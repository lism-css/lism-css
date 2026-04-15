import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type ModalInnerProps = { offset?: string };

export default function ModalInner({ children, className, offset, style, ...props }: ModalInnerProps & LismComponentProps) {
  const mergedStyle = offset ? { ...style, '--offset': offset } : style;
  return (
    <Lism className={atts(className, 'c--modal_inner')} style={mergedStyle} {...props}>
      {children}
    </Lism>
  );
}
