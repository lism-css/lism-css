import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { defaultProps } from '../getProps';

export default function ModalBody({ children, className, ...props }: LismComponentProps) {
  return (
    <Lism {...defaultProps.body} {...props} className={atts(className, defaultProps.body.className)}>
      {children}
    </Lism>
  );
}
