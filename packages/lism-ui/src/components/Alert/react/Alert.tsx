import type { ElementType } from 'react';
import { Flow, Lism, Icon, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getAlertProps, { type AlertProps } from '../getProps';
import '../_style.css';

export function Alert<T extends ElementType = 'div'>({ children, className, ...inputProps }: AlertProps & LismComponentProps<T>) {
  const { icon, layout, flow, ...alertProps } = getAlertProps(inputProps);

  return (
    <Lism layout={layout} className={atts(className, 'b--alert')} {...alertProps}>
      <Icon icon={icon} isSide={layout === 'withSide'} />
      <Flow flow={flow}>{children}</Flow>
    </Lism>
  );
}
