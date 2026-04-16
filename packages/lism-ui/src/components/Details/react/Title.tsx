import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

/**
 * Title - タイトルコンポーネント
 */
export default function Title<T extends ElementType = 'span'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism as="span" fx="1" set="plain" {...(props as object)} className={atts(className, 'c--details_title')}>
      {children}
    </Lism>
  );
}
