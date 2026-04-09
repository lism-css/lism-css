import { Lism, Icon, type LismComponentProps, type IconProps } from 'lism-css/react';
import { defaultProps } from '../getProps';

type CloseBtnProps = LismComponentProps<'button'> & {
  modalId?: string;
  icon?: IconProps['icon'];
  srText?: string;
};

export default function CloseBtn({ children, modalId = '', icon = undefined, srText = 'Close', ...props }: CloseBtnProps) {
  return (
    <Lism data-modal-close={modalId} {...defaultProps.closeBtn} {...props}>
      {children ? (
        children
      ) : (
        <>
          <Icon icon={icon} />
          <span className="u--srOnly">{srText || 'Close'}</span>
        </>
      )}
    </Lism>
  );
}
