import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';

// CSS疑似要素（::before / ::after）でアイコンを描画するコンポーネント
export default function Icon<T extends ElementType = 'span'>({ className, ...props }: LismComponentProps<T>) {
  return <Lism atomic="icon" as="span" aria-hidden="true" className={atts(className, 'b--accordion_icon')} {...(props as object)} />;
}
