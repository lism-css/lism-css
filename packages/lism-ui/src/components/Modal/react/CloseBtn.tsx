import type { ElementType } from 'react';
import { Lism, Icon, type LismComponentProps, type IconProps } from 'lism-css/react';
import { defaultProps } from '../getProps';

type CloseBtnProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  modalId?: string;
  icon?: IconProps['icon'];
  srText?: string;
};

export default function CloseBtn<T extends ElementType = 'button'>({
  children,
  modalId = '',
  icon = undefined,
  srText = 'Close',
  ...props
}: CloseBtnProps<T>) {
  return (
    <Lism data-modal-close={modalId} {...(defaultProps.closeBtn as object)} {...(props as object)}>
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
