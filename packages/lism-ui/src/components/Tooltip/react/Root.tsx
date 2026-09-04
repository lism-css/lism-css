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
  offset?: string;
};

/**
 * Trigger と Popup をまとめるルート要素（アンカーのスコープ）
 * delay / offset は --tooltip-* 変数として Root のインラインに出し、CSS 側で Root が受け取る
 */
export default function Root<T extends ElementType = 'span'>({
  children,
  className,
  tooltipId,
  delay,
  offset,
  style,
  ...props
}: TooltipRootProps & LismComponentProps<T>) {
  const generatedId = useId();
  const theTooltipId = tooltipId || generatedId;

  // document への委譲リスナーは永続シングルトン。Root の unmount では解除しない
  useEffect(() => {
    setTooltip();
  }, []);

  const mergedStyle =
    delay || offset ? { ...style, ...(delay ? { '--tooltip-delay': delay } : {}), ...(offset ? { '--tooltip-offset': offset } : {}) } : style;

  return (
    <TooltipContext.Provider value={{ tooltipId: theTooltipId }}>
      <Lism as="span" className={atts(className, 'b--tooltip')} style={mergedStyle} {...(props as object)}>
        {children}
      </Lism>
    </TooltipContext.Provider>
  );
}
