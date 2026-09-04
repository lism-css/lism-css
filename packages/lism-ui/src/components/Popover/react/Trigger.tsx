'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { PopoverContext } from './context';

type TriggerProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  popoverId?: string;
};

/**
 * 開閉トリガー（開閉・aria-expanded はネイティブの Popover API に任せる）
 * popoverId: 自身の prop → Context → プレースホルダー の順で解決する
 */
export default function Trigger<T extends ElementType = 'button'>({ children, className, popoverId, ...props }: TriggerProps<T>) {
  const ctx = useContext(PopoverContext);
  const theId = popoverId || ctx?.popoverId || '__LISM_POPOVER_ID__';

  return (
    <Lism as="button" type="button" className={atts(className, 'b--popover_trigger')} set="plain" popoverTarget={theId} {...(props as object)}>
      {children}
    </Lism>
  );
}
