import { Lism, type LismComponentProps } from '../Lism';

type ListAllowedTag = 'ul' | 'ol';

export default function List<T extends ListAllowedTag = 'ul'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'ul'} {...props} />;
}
