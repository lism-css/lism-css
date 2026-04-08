import { Lism, type LismComponentProps } from 'lism-css/react';
import { defaultProps } from '../getProps';

export default function ModalBody({ children, ...props }: LismComponentProps) {
  return (
    <Lism {...defaultProps.body} {...props}>
      {children}
    </Lism>
  );
}
