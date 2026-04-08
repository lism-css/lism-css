import { Frame, type LismComponentProps } from 'lism-css/react';

type AvatarProps = LismComponentProps & {
  size?: string;
  src?: string;
  alt?: string;
};

export default function Avatar({ size = '1.5em', src = '', alt = '', ...props }: AvatarProps) {
  return (
    <Frame lismClass="c--avatar" ar="1/1" w={size} bdrs="99" {...props}>
      <img src={src} alt={alt} width="100%" height="100%" decoding="async" />
    </Frame>
  );
}
