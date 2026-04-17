'use client';
import { useRef, useId, useEffect } from 'react';
import type { ElementType } from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import atts from 'lism-css/lib/helper/atts';
import { type LismComponentProps } from 'lism-css/react';
import { setEvent } from '../setAccordion';
import { AccordionContext } from './context';

/**
 * 個別のアコーディオンアイテム（setEvent で開閉イベントを登録）
 */
export default function Item<T extends ElementType = 'div'>({ children, className, as, ...props }: LismComponentProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const accID = useId();

  useEffect(() => {
    if (!ref.current) return;
    return setEvent(ref.current);
  }, []);

  // Lism コンポーネントは ref を forwardRef していないため、React 18 互換のため動的 Tag + getLismProps で実装
  const Tag = as ?? 'div';
  const lismProps = getLismProps({
    className: atts(className, 'c--accordion_item'),
    ...(props as object),
  });

  return (
    <AccordionContext.Provider value={{ accID }}>
      <Tag ref={ref} {...lismProps}>
        {children}
      </Tag>
    </AccordionContext.Provider>
  );
}
