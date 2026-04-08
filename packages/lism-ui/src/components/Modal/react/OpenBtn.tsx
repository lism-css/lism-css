import { Lism, type LismComponentProps } from 'lism-css/react';
import { defaultProps } from '../getProps';

type OpenBtnProps = LismComponentProps & {
  modalId?: string;
};

export default function OpenBtn({ children, modalId = '', ...props }: OpenBtnProps) {
  return (
    <Lism data-modal-open={modalId} {...(defaultProps.openBtn as LismComponentProps)} {...props}>
      {children}
    </Lism>
  );
}
