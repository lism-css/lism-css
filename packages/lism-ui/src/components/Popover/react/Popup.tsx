'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { PopoverContext } from './context';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverType = 'auto' | 'manual';

type PopupProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
  id?: string;
  side?: PopoverSide;
  align?: PopoverAlign;
  offset?: string;
  type?: PopoverType;
};

/**
 * ポップアップ本体（開閉・light dismiss・Esc・フォーカス復帰はネイティブの Popover API に任せる）
 * id: 自身の prop → Context → プレースホルダー の順で解決する
 */
export default function Popup<T extends ElementType = 'div'>({
  children,
  className,
  id,
  side = 'bottom',
  align = 'center',
  offset,
  type = 'auto',
  style,
  ...props
}: PopupProps<T>) {
  const ctx = useContext(PopoverContext);
  const theId = id || ctx?.popoverId || '__LISM_POPOVER_ID__';
  const mergedStyle = offset ? { ...style, '--popover-offset': offset } : style;

  return (
    <Lism
      className={atts(className, 'b--popover_popup')}
      id={theId}
      popover={type}
      data-side={side}
      data-align={align}
      style={mergedStyle}
      {...(props as object)}
    >
      {children}
    </Lism>
  );
}
