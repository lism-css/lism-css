import type { ElementType } from 'react';
import { Lism, Icon, type LismComponentProps, type IconProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

type CloseBtnProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  modalId?: string;
  icon?: IconProps['icon'];
  srText?: string;
};

export default function CloseBtn<T extends ElementType = 'button'>({
  children,
  className,
  modalId = '',
  icon,
  srText = 'Close',
  ...props
}: CloseBtnProps<T>) {
  return (
    <Lism
      as="button"
      type="button"
      className={atts(className, 'b--modal_closeBtn')}
      set="plain"
      hov="-o"
      data-modal-close={modalId}
      {...(props as object)}
    >
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
