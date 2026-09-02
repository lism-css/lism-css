'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, Icon, type LismComponentProps, type IconProps } from 'lism-css/react';
import { PopoverContext } from './context';

type CloseProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  popoverId?: string;
  icon?: IconProps['icon'];
  srText?: string;
};

/**
 * 閉じるボタン（popovertargetaction="hide" でネイティブに閉じる）
 * popoverId: 自身の prop → Context → プレースホルダー の順で解決する
 */
export default function Close<T extends ElementType = 'button'>({ children, className, popoverId, icon, srText = 'Close', ...props }: CloseProps<T>) {
  const ctx = useContext(PopoverContext);
  const theId = popoverId || ctx?.popoverId || '__LISM_POPOVER_ID__';

  return (
    <Lism
      as="button"
      type="button"
      className={atts(className, 'b--popover_close')}
      set="plain"
      popoverTarget={theId}
      popoverTargetAction="hide"
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
