import { Flow, Flex, Stack, Icon, Center, type LismComponentProps, type PresetIconName } from 'lism-css/react';
import getCalloutProps, { type CalloutProps } from '../getProps';

export default function Callout({ children, ...inputProps }: CalloutProps & LismComponentProps) {
  const { icon, title, flow, ...calloutProps } = getCalloutProps(inputProps);

  return (
    <Stack {...calloutProps}>
      {title && (
        <Flex className="c--callout_head" c="keycolor" fw="bold" ai="center" g="10">
          <Center className="c--callout_icon" fz="xl">
            <Icon icon={icon as PresetIconName} />
          </Center>
          <span className="c--callout_title">{title}</span>
        </Flex>
      )}
      <Flow className="c--callout_body" flow={flow}>
        {children}
      </Flow>
    </Stack>
  );
}
