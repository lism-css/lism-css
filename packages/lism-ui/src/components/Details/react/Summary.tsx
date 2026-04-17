import type { ElementType } from 'react';
import { Flex, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

/**
 * Summary - サマリーコンポーネント
 * details要素のsummary部分
 */
export default function Summary<T extends ElementType = 'summary'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Flex as="summary" g="10" ai="center" className={atts(className, 'c--details_summary')} {...(props as object)}>
      {children}
    </Flex>
  );
}
