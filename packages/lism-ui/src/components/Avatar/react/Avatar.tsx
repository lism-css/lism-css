import type { ElementType } from 'react';
import { Frame, type LayoutComponentProps } from 'lism-css/react';
import type { FrameProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import '../_style.css';

type AvatarProps<T extends ElementType = 'div'> = LayoutComponentProps<T, FrameProps> & {
  size?: string;
  src?: string;
  alt?: string;
};

export function Avatar<T extends ElementType = 'div'>({ size, src = '', alt = '', className, ...props }: AvatarProps<T>) {
  return (
    <Frame className={atts(className, 'b--avatar')} w={size} {...(props as LayoutComponentProps<T, FrameProps>)}>
      <img src={src} alt={alt} width="100%" height="100%" decoding="async" />
    </Frame>
  );
}
