import { Lism, type LismComponentProps } from '../Lism';

type TextAllowedTag = 'p' | 'div' | 'blockquote' | 'address';

export default function Text({ as = 'p', ...props }: LismComponentProps<'p', TextAllowedTag>) {
  return <Lism as={as} {...props} />;
}
