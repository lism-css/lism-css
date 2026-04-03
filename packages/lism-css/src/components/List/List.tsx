import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

type ListAllowedTag = 'ul' | 'ol' | 'dl';

export default function List<T extends ListAllowedTag | Exclude<ElementType, string> = 'ul'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'ul'} {...props} />;
}
