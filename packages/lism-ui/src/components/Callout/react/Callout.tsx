import type { ElementType } from 'react';
import { Flow, Flex, Stack, Icon, Center, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getCalloutProps, { type CalloutProps } from '../getProps';

export default function Callout<T extends ElementType = 'div'>({ children, className, ...inputProps }: CalloutProps & LismComponentProps<T>) {
  const { icon, title, flow, ...calloutProps } = getCalloutProps(inputProps);

  return (
    <Stack className={atts(className, 'c--callout')} {...calloutProps}>
      {title && (
        <Flex className="c--callout_head" c="keycolor" fw="bold" ai="center" g="10">
          <Center className="c--callout_icon" fz="xl">
            <Icon icon={icon} />
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
