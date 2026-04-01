import { Lism, type LismComponentProps } from '../Lism';

type ListAllowedTag = 'ul' | 'ol';

export default function List({ as = 'ul', ...props }: LismComponentProps<'ul', ListAllowedTag>) {
  return <Lism as={as} {...props} />;
}
