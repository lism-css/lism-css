import type { ElementType } from 'react';
import { Flow, Lism, Center, Icon, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getAlertProps, { type AlertProps } from '../getProps';

export default function Alert<T extends ElementType = 'div'>({ children, className, ...inputProps }: AlertProps & LismComponentProps<T>) {
  const { icon, layout, flow, ...alertProps } = getAlertProps(inputProps);

  return (
    <Lism layout={layout} className={atts(className, 'c--alert')} {...alertProps}>
      <Center isSide={layout === 'sideMain'} c="keycolor" fz="xl" fxsh="0">
        <Icon icon={icon} />
      </Center>
      <Flow flow={flow}>{children}</Flow>
    </Lism>
  );
}
