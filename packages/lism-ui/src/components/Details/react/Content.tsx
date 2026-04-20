import type { ElementType } from 'react';
import { Lism, Flow, type LayoutComponentProps } from 'lism-css/react';
import type { FlowLayoutProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';

/**
 * Content - コンテンツコンポーネント
 */
export default function Content<T extends ElementType = 'div'>({ children, className, ...props }: LayoutComponentProps<T, FlowLayoutProps>) {
  return (
    <Lism className="c--details_body">
      <Flow flow="s" className={atts(className, 'c--details_content')} {...(props as object)}>
        {children}
      </Flow>
    </Lism>
  );
}
