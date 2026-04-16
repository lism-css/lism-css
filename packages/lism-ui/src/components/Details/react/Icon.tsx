import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

/**
 * Icon - アイコンコンポーネント
 */
export default function Icon<T extends ElementType = 'span'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism atomic="icon" as="span" aria-hidden="true" {...(props as object)} className={atts(className, 'c--details_icon')}>
      {children}
    </Lism>
  );
}
