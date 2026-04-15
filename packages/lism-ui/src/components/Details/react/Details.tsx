import getLismProps from 'lism-css/lib/getLismProps';
import { type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';

import '../_style.css';

type DetailsRootProps = LismComponentProps<'details'> & { open?: boolean };

/**
 * Details - ルートコンポーネント
 * details要素をレンダリング
 */
export default function Details({ children, open, className, ...props }: DetailsRootProps) {
  const lismProps = getLismProps({
    className: atts(className, 'c--details'),
    ...props,
  });

  return (
    <details open={open} {...lismProps}>
      {children}
    </details>
  );
}
