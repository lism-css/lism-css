import { Lism, type LismComponentProps } from 'lism-css/react';
import { getInnerProps, type ModalInnerProps } from '../getProps';

export default function ModalInner({ children, ...props }: ModalInnerProps & LismComponentProps) {
  return <Lism {...getInnerProps(props)}>{children}</Lism>;
}
