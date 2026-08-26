import type { ElementType } from 'react';
import { Flow, Flex, Stack, Icon, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getCalloutProps, { type CalloutProps } from '../getProps';
import '../_style.css';

export function Callout<T extends ElementType = 'div'>({ children, className, ...inputProps }: CalloutProps & LismComponentProps<T>) {
  const { icon, title, flow, ...calloutProps } = getCalloutProps(inputProps);

  return (
    <Stack className={atts(className, 'b--callout')} {...calloutProps}>
      {title && (
        <Flex className="b--callout_title">
          <Icon icon={icon} size="1.25em" />
          <span>{title}</span>
        </Flex>
      )}
      <Flow className="b--callout_body" flow={flow}>
        {children}
      </Flow>
    </Stack>
  );
}
