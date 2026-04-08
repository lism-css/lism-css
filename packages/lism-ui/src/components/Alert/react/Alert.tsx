import { Flow, Lism, Center, Icon, type LismComponentProps, type PresetIconName } from 'lism-css/react';
import getAlertProps, { type AlertProps } from '../getProps';

export default function Alert({ children, ...inputProps }: AlertProps & LismComponentProps) {
  const { icon, layout, flow, ...alertProps } = getAlertProps(inputProps);

  return (
    <Lism layout={layout} {...alertProps}>
      <Center isSide={layout === 'sideMain'} c="keycolor" fz="xl" fxsh="0">
        <Icon icon={icon as PresetIconName} />
      </Center>
      <Flow flow={flow}>{children}</Flow>
    </Lism>
  );
}
