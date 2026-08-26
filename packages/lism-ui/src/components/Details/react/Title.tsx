import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

/**
 * Title - タイトルコンポーネント
 * as に見出しタグなどを指定した場合は set--plain でデフォルトスタイルをリセットする
 */
export default function Title<T extends ElementType = 'span'>({ children, className, as, ...props }: LismComponentProps<T>) {
  const isSpan = !as || as === 'span';
  return (
    <Lism as={(as ?? 'span') as 'span'} set={isSpan ? undefined : 'plain'} className={atts(className, 'b--details_title')} {...(props as object)}>
      {children}
    </Lism>
  );
}
