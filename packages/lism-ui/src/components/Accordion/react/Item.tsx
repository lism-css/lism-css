'use client';
import { useRef, useId, useEffect } from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import atts from 'lism-css/lib/helper/atts';
import { type LismComponentProps } from 'lism-css/react';
import { setEvent } from '../setAccordion';
import { AccordionContext } from './context';

/**
 * 個別のアコーディオンアイテム（<div> ベース、setEvent で開閉イベントを登録）
 */
export default function Item({ children, className, ...props }: LismComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  // コンポーネント単位でユニークIDを生成
  const accID = useId();

  // マウント時に開閉イベントを登録（アンマウント時にクリーンアップ）
  useEffect(() => {
    if (!ref.current) return;
    return setEvent(ref.current);
  }, []);

  const lismProps = getLismProps({
    className: atts(className, 'c--accordion_item'),
    ...props,
  });

  return (
    <AccordionContext.Provider value={{ accID }}>
      <div ref={ref} {...lismProps}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
