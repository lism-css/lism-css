import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import getAvatarProps, { type AvatarProps } from '../getProps';
import '../_style.css';

export function Avatar<T extends ElementType = 'div'>({ size, src, name, alt, className, ...props }: LayoutComponentProps<T> & AvatarProps) {
  const { label, initial, initialAtts } = getAvatarProps({ name, alt });

  return (
    <Lism
      layout={src ? 'frame' : 'center'}
      className={atts(className, 'b--avatar', !src && 'b--avatar--initial')}
      w={size}
      {...(props as LismComponentProps<T>)}
    >
      {src ? <img src={src} alt={label} width="100%" height="100%" decoding="async" /> : <span {...initialAtts}>{initial}</span>}
    </Lism>
  );
}
