import type { ElementType } from 'react';
import { Flex, type LayoutComponentProps } from 'lism-css/react';
import type { FlexProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';

/**
 * Summary - サマリーコンポーネント
 * details要素のsummary部分
 */
export default function Summary<T extends ElementType = 'summary'>({ children, className, ...props }: LayoutComponentProps<T, FlexProps>) {
  return (
    <Flex as="summary" g="10" ai="center" className={atts(className, 'c--details_summary')} {...(props as object)}>
      {children}
    </Flex>
  );
}
