'use client';
import { useId } from 'react';
import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { PopoverContext } from './context';

import '../_style.css';

type PopoverRootProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
  popoverId?: string;
  offset?: string;
};

/**
 * Trigger / Popup / Close をまとめるルート要素
 * popoverId 未指定なら自動生成し、Context 経由で子へ配布する
 * offset は --popover-offset 変数として Root のインラインに出し、CSS 側で Root が受け取る
 */
export default function Root<T extends ElementType = 'div'>({ children, className, popoverId, offset, style, ...props }: PopoverRootProps<T>) {
  const generatedId = useId();
  const theId = popoverId || generatedId;
  const mergedStyle = offset ? { ...style, '--popover-offset': offset } : style;

  return (
    <PopoverContext.Provider value={{ popoverId: theId }}>
      <Lism className={atts(className, 'b--popover')} style={mergedStyle} {...(props as object)}>
        {children}
      </Lism>
    </PopoverContext.Provider>
  );
}
