import type { ElementType } from 'react';
import { Lism, Flow, Grid, Frame, Decorator, type LayoutComponentProps } from 'lism-css/react';
import type { GridLayoutProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import '../_style.css';

type Props<T extends ElementType = 'div'> = LayoutComponentProps<T, GridLayoutProps> & {
  name?: string;
  avatar?: string;
  flow?: string;
  variant?: 'speak' | 'think';
  direction?: 'start' | 'end';
  keycolor?: string;
};

export function Chat<T extends ElementType = 'div'>({
  name,
  avatar,
  flow,
  variant = 'speak',
  direction = 'start',
  className,
  children,
  ...props
}: Props<T>) {
  return (
    <Grid className={atts(className, buildModifierClass('b--chat', { variant }))} data-chat-dir={direction} {...(props as object)}>
      {avatar && (
        <Frame className="b--chat_avatar" aria-hidden="true">
          <img src={avatar} alt="" width="60" height="60" decoding="async" />
        </Frame>
      )}
      {name && <Lism className="b--chat_name">{name}</Lism>}
      <Lism className="b--chat_body">
        <Decorator className="b--chat_deco" util="cbox" isSkipFlow />
        <Flow className="b--chat_content" util="cbox" flow={flow}>
          {children}
        </Flow>
      </Lism>
    </Grid>
  );
}
