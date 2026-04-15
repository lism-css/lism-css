import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

/**
 * Summary - サマリーコンポーネント
 * details要素のsummary部分
 */
export default function Summary<T extends ElementType = 'summary'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism as="summary" layout="flex" g="10" ai="center" {...(props as object)} className={atts(className, 'c--details_summary')}>
      {children}
    </Lism>
  );
}
