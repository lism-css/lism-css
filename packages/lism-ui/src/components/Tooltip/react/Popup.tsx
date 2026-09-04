'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { TooltipContext } from './context';

/** ポップアップを出す方向。start/end は書字方向に追従する inline 軸の論理方向 */
export type TooltipSide = 'top' | 'bottom' | 'start' | 'end';
export type TooltipAlign = 'start' | 'center' | 'end';

type PopupProps<T extends ElementType = 'span'> = LismComponentProps<T> & {
  id?: string;
  side?: TooltipSide;
  align?: TooltipAlign;
};

/**
 * ツールチップの中身
 * id: 自身の prop → Context（Root）→ プレースホルダー の順で決まる（子の明示IDが Root より優先）
 */
export default function Popup<T extends ElementType = 'span'>({ children, className, id, side = 'top', align = 'center', ...props }: PopupProps<T>) {
  const ctx = useContext(TooltipContext);
  const theId = id || ctx?.tooltipId || '__LISM_TOOLTIP_ID__';

  return (
    <Lism
      as="span"
      role="tooltip"
      id={theId}
      data-side={side}
      data-align={align}
      className={atts(className, 'b--tooltip_popup')}
      {...(props as object)}
    >
      {children}
    </Lism>
  );
}
