import { Lism, type LismComponentProps } from '../Lism';

type InlineAllowedTag = 'span' | 'em' | 'strong' | 'small' | 'code' | 'time';

export default function Inline({ as = 'span', ...props }: LismComponentProps<'span', InlineAllowedTag>) {
  return <Lism as={as} {...props} />;
}
