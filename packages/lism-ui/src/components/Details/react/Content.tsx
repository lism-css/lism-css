import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

/**
 * Content - コンテンツコンポーネント
 */
export default function Content<T extends ElementType = 'div'>({ children, className, ...props }: LismComponentProps<T>) {
  return (
    <Lism className="c--details_body">
      <Lism layout="flow" flow="s" {...(props as object)} className={atts(className, 'c--details_content')}>
        {children}
      </Lism>
    </Lism>
  );
}
