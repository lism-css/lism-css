import type { ElementType } from 'react';
import { Lism, Flow, Grid, Frame, Decorator, type LayoutComponentProps } from 'lism-css/react';
import type { GridLayoutProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import getChatProps, { defaultProps } from '../getProps';
import type { ChatProps } from '../getProps';
import '../_style.css';

type Props<T extends ElementType = 'div'> = ChatProps &
  LayoutComponentProps<T, GridLayoutProps> & {
    name?: string;
    avatar?: string;
    flow?: string;
  };

export default function Chat<T extends ElementType = 'div'>({
  name,
  avatar,
  flow = 's',
  variant = 'speak',
  className,
  children,
  ...props
}: Props<T>) {
  const { 'data-chat-dir': direction, ...chatProps } = getChatProps(props);

  return (
    <Grid className={atts(className, buildModifierClass('c--chat', { variant }))} data-chat-dir={direction} {...chatProps}>
      {avatar && (
        <Frame className="c--chat_avatar" {...defaultProps.avatar}>
          <img src={avatar} alt="" width="60" height="60" decoding="async" />
        </Frame>
      )}
      {name && (
        <Lism className="c--chat_name" {...defaultProps.name}>
          {name}
        </Lism>
      )}
      <Lism className="c--chat_body" {...defaultProps.body}>
        <Decorator className="c--chat_deco" {...defaultProps.deco} />
        <Flow className="c--chat_content" {...defaultProps.content} flow={flow} jslf={direction}>
          {children}
        </Flow>
      </Lism>
    </Grid>
  );
}
