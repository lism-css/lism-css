'use client';
import { useId, useEffect } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { setTooltip } from '../setTooltip';
import { TooltipContext } from './context';

import '../_style.css';

type TooltipRootProps = {
  tooltipId?: string;
  delay?: string;
};

/**
 * Trigger と Popup をまとめるルート要素（アンカーのスコープ）
 */
export default function Root<T extends ElementType = 'span'>({
  children,
  className,
  tooltipId,
  delay,
  style,
  ...props
}: TooltipRootProps & LismComponentProps<T>) {
  const generatedId = useId();
  const theTooltipId = tooltipId || generatedId;

  // document への委譲リスナーは永続シングルトン。Root の unmount では解除しない
  useEffect(() => {
    setTooltip();
  }, []);

  const mergedStyle = delay ? { ...style, '--tooltip-delay': delay } : style;

  return (
    <TooltipContext.Provider value={{ tooltipId: theTooltipId }}>
      <Lism as="span" className={atts(className, 'b--tooltip')} style={mergedStyle} {...(props as object)}>
        {children}
      </Lism>
    </TooltipContext.Provider>
  );
}
