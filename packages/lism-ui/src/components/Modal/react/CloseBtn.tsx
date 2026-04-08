import { Lism, Icon, type LismComponentProps, type PresetIconName } from 'lism-css/react';
import { defaultProps } from '../getProps';

type CloseBtnProps = LismComponentProps & {
  modalId?: string;
  icon?: PresetIconName;
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
