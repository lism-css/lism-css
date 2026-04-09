import type { ElementType } from 'react';
import { Frame, type LayoutComponentProps } from 'lism-css/react';
import type { FrameProps } from 'lism-css/lib/types/LayoutProps';

type AvatarProps<T extends ElementType = 'div'> = LayoutComponentProps<T, FrameProps> & {
  size?: string;
  src?: string;
  alt?: string;
};

export default function Avatar<T extends ElementType = 'div'>({ size = '1.5em', src = '', alt = '', ...props }: AvatarProps<T>) {
  return (
    <Frame lismClass="c--avatar" ar="1/1" w={size} bdrs="99" {...(props as LayoutComponentProps<T, FrameProps>)}>
      <img src={src} alt={alt} width="100%" height="100%" decoding="async" />
    </Frame>
  );
}
