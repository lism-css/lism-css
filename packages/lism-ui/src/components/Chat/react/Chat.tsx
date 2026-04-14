import type { ElementType } from 'react';
import { Lism, Flow, Grid, Frame, Decorator, type LayoutComponentProps } from 'lism-css/react';
import type { GridLayoutProps } from 'lism-css/lib/types/LayoutProps';
import getChatProps, { defaultProps } from '../getProps';
import type { ChatProps } from '../getProps';
import '../_style.css';

type Props<T extends ElementType = 'div'> = ChatProps &
  LayoutComponentProps<T, GridLayoutProps> & {
    name?: string;
    avatar?: string;
    flow?: string;
  };

export default function Chat<T extends ElementType = 'div'>({ name, avatar, flow = 's', children, ...props }: Props<T>) {
  const { 'data-chat-dir': direction, ...chatProps } = getChatProps(props);

  return (
    <Grid data-chat-dir={direction} {...chatProps}>
      {avatar && (
        <Frame {...defaultProps.avatar}>
          <img src={avatar} alt="" width="60" height="60" decoding="async" />
        </Frame>
      )}
      {name && <Lism {...defaultProps.name}>{name}</Lism>}
      <Lism {...defaultProps.body}>
        <Decorator {...defaultProps.deco} />
        <Flow {...defaultProps.content} flow={flow} jslf={direction}>
          {children}
        </Flow>
      </Lism>
    </Grid>
  );
}
