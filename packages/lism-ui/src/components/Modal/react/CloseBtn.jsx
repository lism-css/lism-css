import { Lism, Icon } from 'lism-css/react';
import { getCloseBtnProps } from '../getProps';

// duration: [s]
export default function CloseBtn({ children, modalId = '', icon, srText = 'Close', ...props }) {
  return (
    <Lism data-modal-close={modalId} {...getCloseBtnProps(props)}>
      {children ? (
        children
      ) : (
        <>
          <Icon icon={icon || 'x'} />
          <span className="u--srOnly">{srText || 'Close'}</span>
        </>
      )}
    </Lism>
  );
}
