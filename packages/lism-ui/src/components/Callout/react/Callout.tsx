import type { ElementType } from 'react';
import { Flow, Flex, Stack, Icon, Center, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getCalloutProps, { type CalloutProps } from '../getProps';

export function Callout<T extends ElementType = 'div'>({ children, className, ...inputProps }: CalloutProps & LismComponentProps<T>) {
  const { icon, title, flow, ...calloutProps } = getCalloutProps(inputProps);

  return (
    <Stack className={atts(className, 'c--callout')} {...calloutProps}>
      {title && (
        <Flex c="keycolor" fw="bold" ai="center" g="10">
          <Center>
            <Icon icon={icon} size="1.25em" />
          </Center>
          <span>{title}</span>
        </Flex>
      )}
      <Flow flow={flow}>{children}</Flow>
    </Stack>
  );
}
