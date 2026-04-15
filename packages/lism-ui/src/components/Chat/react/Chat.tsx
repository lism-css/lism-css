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
  [key: string]: unknown;
};

export default function Chat<T extends ElementType = 'div'>({
  name,
  avatar,
  flow = 's',
  variant = 'speak',
  direction = 'start',
  className,
  children,
  ...props
}: Props<T>) {
  return (
    <Grid className={atts(className, buildModifierClass('c--chat', { variant }))} keycolor="gray" data-chat-dir={direction} ji={direction} {...props}>
      {avatar && (
        <Frame className="c--chat_avatar" bgc="base" ar="1/1" bdrs="99" aria-hidden="true">
          <img src={avatar} alt="" width="60" height="60" decoding="async" />
        </Frame>
      )}
      {name && (
        <Lism className="c--chat_name" c="text-2" fs="italic" fz="2xs" lh="1" py="5" px="10" aslf="end">
          {name}
        </Lism>
      )}
      <Lism className="c--chat_body" pos="relative">
        <Decorator className="c--chat_deco" util="cbox" isSkipFlow pos="absolute" />
        <Flow className="c--chat_content" util="cbox" bdrs="30" p="20" lh="s" flow={flow} jslf={direction}>
          {children}
        </Flow>
      </Lism>
    </Grid>
  );
}
