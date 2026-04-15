import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { defaultProps } from '../getProps';

// CSS疑似要素（::before / ::after）でアイコンを描画するコンポーネント
export default function AccIcon({ className, ...props }: LismComponentProps) {
  return <Lism {...defaultProps.icon} {...props} className={atts(className, defaultProps.icon.className)} />;
}
