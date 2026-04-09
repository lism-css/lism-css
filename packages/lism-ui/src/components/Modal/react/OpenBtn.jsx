import { Lism } from 'lism-css/react';
import { getOpenBtnProps } from '../getProps';

// duration: [s]
export default function OpenBtn({ children, modalId = '', ...props }) {
  return (
    <Lism data-modal-open={modalId} {...getOpenBtnProps(props)}>
      {children}
    </Lism>
  );
}
