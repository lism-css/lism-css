import { Lism, Flow, Grid, Frame, Decorator, type LismComponentProps } from 'lism-css/react';
import getChatProps, { defaultProps } from '../getProps';
import type { ChatProps } from '../getProps';
import '../_style.css';

type Props = ChatProps &
  LismComponentProps & {
    name?: string;
    avatar?: string;
    flow?: string;
  };

export default function Chat({ name, avatar, flow = 's', children, ...props }: Props) {
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
        <Decorator {...defaultProps.deco} className="u--cbox is--skipFlow" />
        <Flow {...defaultProps.content} className="u--cbox" flow={flow} jslf={direction}>
          {children}
        </Flow>
      </Lism>
    </Grid>
  );
}
