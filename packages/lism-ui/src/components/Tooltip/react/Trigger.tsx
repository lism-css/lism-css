'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { TooltipContext } from './context';

type TriggerProps<T extends ElementType = 'button'> = LismComponentProps<T> & {
  tooltipId?: string;
};

/**
 * ツールチップを表示するトリガー
 * tooltipId: 自身の prop → Context（Root）→ プレースホルダー の順で決まる（子の明示IDが Root より優先）
 */
export default function Trigger<T extends ElementType = 'button'>({ children, className, tooltipId, ...props }: TriggerProps<T>) {
  const ctx = useContext(TooltipContext);
  const theTooltipId = tooltipId || ctx?.tooltipId || '__LISM_TOOLTIP_ID__';

  return (
    <Lism
      as="button"
      type="button"
      className={atts(className, 'b--tooltip_trigger')}
      set="plain"
      aria-describedby={theTooltipId}
      {...(props as object)}
    >
      {children}
    </Lism>
  );
}
