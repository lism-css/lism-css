import type { ElementType } from 'react';
import { Frame, type LayoutComponentProps } from 'lism-css/react';
import type { FrameProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import getAvatarProps, { type AvatarProps } from '../getProps';
import '../_style.css';

export function Avatar<T extends ElementType = 'div'>({
  size,
  src,
  name,
  alt,
  className,
  ...props
}: LayoutComponentProps<T, FrameProps> & AvatarProps) {
  const { label, initial, initialAtts } = getAvatarProps({ name, alt });

  return (
    <Frame className={atts(className, 'b--avatar', !src && 'b--avatar--initial')} w={size} {...(props as LayoutComponentProps<T, FrameProps>)}>
      {src ? <img src={src} alt={label} width="100%" height="100%" decoding="async" /> : <span {...initialAtts}>{initial}</span>}
    </Frame>
  );
}
