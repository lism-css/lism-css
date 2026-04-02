import { Lism, type LismComponentProps } from '../Lism';

type TextAllowedTag = 'p' | 'div' | 'blockquote' | 'address' | 'figcaption' | 'pre';

export default function Text<T extends TextAllowedTag = 'p'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'p'} {...props} />;
}
