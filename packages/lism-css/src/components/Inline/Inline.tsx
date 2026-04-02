import { Lism, type LismComponentProps } from '../Lism';

type InlineAllowedTag = 'span' | 'em' | 'strong' | 'small' | 'code' | 'time';

export default function Inline<T extends InlineAllowedTag = 'span'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'span'} {...props} />;
}
